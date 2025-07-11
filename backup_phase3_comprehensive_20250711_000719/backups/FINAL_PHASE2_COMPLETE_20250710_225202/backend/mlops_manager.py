"""
MLOps Integration Framework for PathwayIQ
Phase 2.2: Technical Infrastructure

Chief Technical Architect Implementation
"""

import asyncio
import json
import hashlib
import uuid
from typing import Dict, List, Optional, Any, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
import pickle
import numpy as np
from pathlib import Path
import tempfile
import os

logger = structlog.get_logger()

class ModelType(Enum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    RECOMMENDATION = "recommendation"
    NLP = "nlp"
    COMPUTER_VISION = "computer_vision"

class ModelStatus(Enum):
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    FAILED = "failed"
    DEPRECATED = "deprecated"

class DeploymentEnvironment(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

@dataclass
class ModelMetadata:
    model_id: str
    name: str
    version: str
    model_type: ModelType
    description: str
    created_at: datetime
    updated_at: datetime
    status: ModelStatus
    metrics: Dict[str, float]
    hyperparameters: Dict[str, Any]
    training_data_hash: str
    model_size_mb: float
    creator: str

@dataclass
class ModelExperiment:
    experiment_id: str
    model_id: str
    name: str
    parameters: Dict[str, Any]
    metrics: Dict[str, float]
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    logs: List[str]

@dataclass
class DeploymentConfig:
    environment: DeploymentEnvironment
    resource_requirements: Dict[str, Any]
    scaling_config: Dict[str, Any]
    health_check_config: Dict[str, Any]
    rollback_strategy: str

class MLModelManager:
    """Manage ML models with versioning and lifecycle"""
    
    def __init__(self, model_store_path: str = "/tmp/pathwayiq_models"):
        self.model_store_path = Path(model_store_path)
        self.model_store_path.mkdir(exist_ok=True)
        self.models_registry = {}
        self.active_models = {}
        self.model_metrics = {}
        
    async def register_model(self, 
                           name: str,
                           model_type: ModelType,
                           model_object: Any,
                           version: str = "1.0",
                           description: str = "",
                           hyperparameters: Optional[Dict] = None,
                           training_data_hash: str = "",
                           creator: str = "system") -> str:
        """Register a new model"""
        try:
            model_id = str(uuid.uuid4())
            model_path = self.model_store_path / f"{model_id}.pkl"
            
            # Serialize and save model
            with open(model_path, 'wb') as f:
                pickle.dump(model_object, f)
            
            # Calculate model size
            model_size_mb = model_path.stat().st_size / (1024 * 1024)
            
            # Create metadata
            metadata = ModelMetadata(
                model_id=model_id,
                name=name,
                version=version,
                model_type=model_type,
                description=description,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                status=ModelStatus.TRAINED,
                metrics={},
                hyperparameters=hyperparameters or {},
                training_data_hash=training_data_hash,
                model_size_mb=model_size_mb,
                creator=creator
            )
            
            # Register model
            self.models_registry[model_id] = metadata
            
            logger.info(f"✅ Model registered: {name} (ID: {model_id})")
            return model_id
            
        except Exception as e:
            logger.error(f"Model registration failed: {e}")
            raise
    
    async def load_model(self, model_id: str) -> Any:
        """Load model from storage"""
        try:
            if model_id not in self.models_registry:
                raise ValueError(f"Model {model_id} not found in registry")
            
            model_path = self.model_store_path / f"{model_id}.pkl"
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            
            # Update last accessed time
            self.models_registry[model_id].updated_at = datetime.utcnow()
            
            return model
            
        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            raise
    
    async def deploy_model(self, 
                          model_id: str, 
                          environment: DeploymentEnvironment,
                          config: Optional[DeploymentConfig] = None) -> Dict[str, Any]:
        """Deploy model to specified environment"""
        try:
            if model_id not in self.models_registry:
                raise ValueError(f"Model {model_id} not found")
            
            metadata = self.models_registry[model_id]
            
            # Load model to verify it works
            model = await self.load_model(model_id)
            
            # Create deployment record
            deployment_id = str(uuid.uuid4())
            deployment_info = {
                'deployment_id': deployment_id,
                'model_id': model_id,
                'environment': environment.value,
                'deployed_at': datetime.utcnow().isoformat(),
                'config': asdict(config) if config else {},
                'status': 'active'
            }
            
            # Update model status
            metadata.status = ModelStatus.DEPLOYED
            metadata.updated_at = datetime.utcnow()
            
            # Add to active models
            self.active_models[f"{environment.value}_{model_id}"] = {
                'model': model,
                'metadata': metadata,
                'deployment_info': deployment_info
            }
            
            logger.info(f"✅ Model deployed: {metadata.name} to {environment.value}")
            return deployment_info
            
        except Exception as e:
            logger.error(f"Model deployment failed: {e}")
            raise
    
    async def predict(self, 
                     model_id: str, 
                     environment: DeploymentEnvironment,
                     input_data: Any) -> Dict[str, Any]:
        """Make prediction using deployed model"""
        try:
            deployment_key = f"{environment.value}_{model_id}"
            
            if deployment_key not in self.active_models:
                raise ValueError(f"Model {model_id} not deployed in {environment.value}")
            
            deployment = self.active_models[deployment_key]
            model = deployment['model']
            metadata = deployment['metadata']
            
            # Make prediction
            start_time = datetime.utcnow()
            
            if hasattr(model, 'predict'):
                prediction = model.predict(input_data)
            elif hasattr(model, 'forward'):
                prediction = model.forward(input_data)
            else:
                raise ValueError("Model does not have predict or forward method")
            
            end_time = datetime.utcnow()
            inference_time = (end_time - start_time).total_seconds()
            
            # Log prediction metrics
            prediction_id = str(uuid.uuid4())
            self._log_prediction_metrics(model_id, prediction_id, inference_time)
            
            return {
                'prediction_id': prediction_id,
                'model_id': model_id,
                'model_name': metadata.name,
                'model_version': metadata.version,
                'prediction': prediction.tolist() if hasattr(prediction, 'tolist') else prediction,
                'inference_time_seconds': inference_time,
                'timestamp': end_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
    
    def _log_prediction_metrics(self, model_id: str, prediction_id: str, inference_time: float):
        """Log prediction metrics"""
        if model_id not in self.model_metrics:
            self.model_metrics[model_id] = {
                'total_predictions': 0,
                'avg_inference_time': 0.0,
                'prediction_history': []
            }
        
        metrics = self.model_metrics[model_id]
        metrics['total_predictions'] += 1
        
        # Update average inference time
        current_avg = metrics['avg_inference_time']
        total_predictions = metrics['total_predictions']
        metrics['avg_inference_time'] = (
            (current_avg * (total_predictions - 1) + inference_time) / total_predictions
        )
        
        # Store recent predictions (last 1000)
        metrics['prediction_history'].append({
            'prediction_id': prediction_id,
            'inference_time': inference_time,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        if len(metrics['prediction_history']) > 1000:
            metrics['prediction_history'] = metrics['prediction_history'][-1000:]
    
    async def get_model_performance(self, model_id: str) -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            if model_id not in self.models_registry:
                raise ValueError(f"Model {model_id} not found")
            
            metadata = self.models_registry[model_id]
            metrics = self.model_metrics.get(model_id, {})
            
            return {
                'model_id': model_id,
                'model_name': metadata.name,
                'model_version': metadata.version,
                'status': metadata.status.value,
                'total_predictions': metrics.get('total_predictions', 0),
                'avg_inference_time': metrics.get('avg_inference_time', 0.0),
                'model_size_mb': metadata.model_size_mb,
                'created_at': metadata.created_at.isoformat(),
                'last_updated': metadata.updated_at.isoformat(),
                'training_metrics': metadata.metrics
            }
            
        except Exception as e:
            logger.error(f"Performance metrics failed: {e}")
            return {'error': str(e)}
    
    async def list_models(self, model_type: Optional[ModelType] = None) -> List[Dict[str, Any]]:
        """List all registered models"""
        models = []
        
        for model_id, metadata in self.models_registry.items():
            if model_type is None or metadata.model_type == model_type:
                model_info = {
                    'model_id': model_id,
                    'name': metadata.name,
                    'version': metadata.version,
                    'type': metadata.model_type.value,
                    'status': metadata.status.value,
                    'created_at': metadata.created_at.isoformat(),
                    'size_mb': metadata.model_size_mb,
                    'creator': metadata.creator
                }
                models.append(model_info)
        
        return sorted(models, key=lambda x: x['created_at'], reverse=True)

class ExperimentTracker:
    """Track ML experiments and hyperparameter tuning"""
    
    def __init__(self):
        self.experiments = {}
        self.experiment_results = {}
    
    async def start_experiment(self, 
                              name: str, 
                              model_id: str,
                              parameters: Dict[str, Any]) -> str:
        """Start a new experiment"""
        experiment_id = str(uuid.uuid4())
        
        experiment = ModelExperiment(
            experiment_id=experiment_id,
            model_id=model_id,
            name=name,
            parameters=parameters,
            metrics={},
            start_time=datetime.utcnow(),
            end_time=None,
            status='running',
            logs=[]
        )
        
        self.experiments[experiment_id] = experiment
        logger.info(f"✅ Experiment started: {name} (ID: {experiment_id})")
        
        return experiment_id
    
    async def log_metrics(self, experiment_id: str, metrics: Dict[str, float]):
        """Log metrics for an experiment"""
        if experiment_id in self.experiments:
            self.experiments[experiment_id].metrics.update(metrics)
            logger.info(f"Metrics logged for experiment {experiment_id}: {metrics}")
    
    async def log_message(self, experiment_id: str, message: str):
        """Log message for an experiment"""
        if experiment_id in self.experiments:
            timestamp = datetime.utcnow().isoformat()
            self.experiments[experiment_id].logs.append(f"[{timestamp}] {message}")
    
    async def end_experiment(self, experiment_id: str, status: str = 'completed'):
        """End an experiment"""
        if experiment_id in self.experiments:
            experiment = self.experiments[experiment_id]
            experiment.end_time = datetime.utcnow()
            experiment.status = status
            
            logger.info(f"✅ Experiment ended: {experiment.name}")
    
    async def get_experiment_results(self, experiment_id: str) -> Dict[str, Any]:
        """Get experiment results"""
        if experiment_id not in self.experiments:
            raise ValueError(f"Experiment {experiment_id} not found")
        
        experiment = self.experiments[experiment_id]
        duration = None
        
        if experiment.end_time:
            duration = (experiment.end_time - experiment.start_time).total_seconds()
        
        return {
            'experiment_id': experiment_id,
            'name': experiment.name,
            'model_id': experiment.model_id,
            'parameters': experiment.parameters,
            'metrics': experiment.metrics,
            'status': experiment.status,
            'start_time': experiment.start_time.isoformat(),
            'end_time': experiment.end_time.isoformat() if experiment.end_time else None,
            'duration_seconds': duration,
            'logs': experiment.logs[-10:]  # Last 10 log entries
        }
    
    async def compare_experiments(self, experiment_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple experiments"""
        comparison = {
            'experiments': [],
            'metrics_comparison': {},
            'best_experiment': None
        }
        
        all_metrics = set()
        best_score = float('-inf')
        best_experiment_id = None
        
        for exp_id in experiment_ids:
            if exp_id in self.experiments:
                exp = self.experiments[exp_id]
                exp_data = {
                    'experiment_id': exp_id,
                    'name': exp.name,
                    'parameters': exp.parameters,
                    'metrics': exp.metrics,
                    'status': exp.status
                }
                comparison['experiments'].append(exp_data)
                all_metrics.update(exp.metrics.keys())
                
                # Find best experiment (highest accuracy or lowest loss)
                score = exp.metrics.get('accuracy', exp.metrics.get('f1_score', 0))
                if score > best_score:
                    best_score = score
                    best_experiment_id = exp_id
        
        # Create metrics comparison
        for metric in all_metrics:
            comparison['metrics_comparison'][metric] = []
            for exp in comparison['experiments']:
                comparison['metrics_comparison'][metric].append({
                    'experiment_id': exp['experiment_id'],
                    'value': exp['metrics'].get(metric, None)
                })
        
        comparison['best_experiment'] = best_experiment_id
        
        return comparison

class ModelMonitor:
    """Monitor deployed models for performance drift"""
    
    def __init__(self):
        self.monitoring_data = {}
        self.alerts = []
    
    async def monitor_model_drift(self, 
                                 model_id: str, 
                                 predictions: List[float],
                                 actuals: Optional[List[float]] = None) -> Dict[str, Any]:
        """Monitor model for drift"""
        if model_id not in self.monitoring_data:
            self.monitoring_data[model_id] = {
                'baseline_stats': None,
                'recent_predictions': [],
                'performance_history': []
            }
        
        monitoring = self.monitoring_data[model_id]
        monitoring['recent_predictions'].extend(predictions)
        
        # Keep only recent predictions (last 1000)
        if len(monitoring['recent_predictions']) > 1000:
            monitoring['recent_predictions'] = monitoring['recent_predictions'][-1000:]
        
        # Calculate drift metrics
        drift_metrics = self._calculate_drift_metrics(model_id, predictions)
        
        # Check for alerts
        await self._check_drift_alerts(model_id, drift_metrics)
        
        return drift_metrics
    
    def _calculate_drift_metrics(self, model_id: str, predictions: List[float]) -> Dict[str, Any]:
        """Calculate drift metrics"""
        monitoring = self.monitoring_data[model_id]
        
        if not monitoring['recent_predictions']:
            return {'status': 'insufficient_data'}
        
        recent_predictions = monitoring['recent_predictions']
        
        # Calculate statistics
        mean_pred = np.mean(recent_predictions)
        std_pred = np.std(recent_predictions)
        
        # Set baseline if not exists
        if monitoring['baseline_stats'] is None:
            monitoring['baseline_stats'] = {
                'mean': mean_pred,
                'std': std_pred,
                'timestamp': datetime.utcnow().isoformat()
            }
            return {'status': 'baseline_set', 'baseline_mean': mean_pred, 'baseline_std': std_pred}
        
        # Compare with baseline
        baseline = monitoring['baseline_stats']
        mean_drift = abs(mean_pred - baseline['mean']) / baseline['mean'] * 100
        std_drift = abs(std_pred - baseline['std']) / baseline['std'] * 100 if baseline['std'] > 0 else 0
        
        drift_status = 'normal'
        if mean_drift > 20 or std_drift > 30:
            drift_status = 'significant_drift'
        elif mean_drift > 10 or std_drift > 20:
            drift_status = 'moderate_drift'
        
        return {
            'status': drift_status,
            'mean_drift_percent': round(mean_drift, 2),
            'std_drift_percent': round(std_drift, 2),
            'current_mean': round(mean_pred, 4),
            'baseline_mean': round(baseline['mean'], 4),
            'current_std': round(std_pred, 4),
            'baseline_std': round(baseline['std'], 4)
        }
    
    async def _check_drift_alerts(self, model_id: str, drift_metrics: Dict[str, Any]):
        """Check for drift alerts"""
        if drift_metrics.get('status') == 'significant_drift':
            alert = {
                'alert_id': str(uuid.uuid4()),
                'model_id': model_id,
                'alert_type': 'drift_detected',
                'severity': 'high',
                'message': f"Significant drift detected in model {model_id}",
                'metrics': drift_metrics,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            self.alerts.append(alert)
            logger.warning(f"🚨 Model drift alert: {alert['message']}")
    
    async def get_monitoring_status(self, model_id: str) -> Dict[str, Any]:
        """Get monitoring status for a model"""
        if model_id not in self.monitoring_data:
            return {'status': 'not_monitored'}
        
        monitoring = self.monitoring_data[model_id]
        recent_alerts = [alert for alert in self.alerts if alert['model_id'] == model_id][-5:]
        
        return {
            'model_id': model_id,
            'monitoring_active': True,
            'baseline_set': monitoring['baseline_stats'] is not None,
            'total_predictions_monitored': len(monitoring['recent_predictions']),
            'recent_alerts': recent_alerts,
            'baseline_stats': monitoring['baseline_stats']
        }

# Global MLOps components
model_manager = MLModelManager()
experiment_tracker = ExperimentTracker()
model_monitor = ModelMonitor()

logger.info("✅ MLOps Integration Framework initialized")