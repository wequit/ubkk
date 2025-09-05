'use client';

import { useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

export default function ReviewPage() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const metrics = [
    {
      title: 'На рассмотрении',
      value: '45',
      change: '+8%',
      changeType: 'positive' as const,
      icon: <i className="ri-eye-line"></i>
    },
    {
      title: 'Требуют доработки',
      value: '12',
      change: '-3%',
      changeType: 'negative' as const,
      icon: <i className="ri-edit-line"></i>
    },
    {
      title: 'Одобрены',
      value: '156',
      change: '+15%',
      changeType: 'positive' as const,
      icon: <i className="ri-check-line"></i>
    },
    {
      title: 'Отклонены',
      value: '23',
      change: '+2%',
      changeType: 'positive' as const,
      icon: <i className="ri-close-line"></i>
    }
  ];

  const applications = [
    {
      id: 'APP-001',
      applicant: 'Айбек Кыдыров',
      type: 'Первичная заявка',
      submittedDate: '2024-01-15',
      status: 'under_review',
      documents: 8,
      completeness: 95,
      riskLevel: 'low'
    },
    {
      id: 'APP-002',
      applicant: 'Нургуль Асанова',
      type: 'Дополнительные документы',
      submittedDate: '2024-01-15',
      status: 'needs_revision',
      documents: 5,
      completeness: 70,
      riskLevel: 'medium'
    },
    {
      id: 'APP-003',
      applicant: 'Марат Беков',
      type: 'Первичная заявка',
      submittedDate: '2024-01-14',
      status: 'under_review',
      documents: 10,
      completeness: 100,
      riskLevel: 'low'
    },
    {
      id: 'APP-004',
      applicant: 'Айгуль Токтосунова',
      type: 'Пересмотр решения',
      submittedDate: '2024-01-14',
      status: 'under_review',
      documents: 12,
      completeness: 90,
      riskLevel: 'high'
    },
    {
      id: 'APP-005',
      applicant: 'Эркин Садыков',
      type: 'Первичная заявка',
      submittedDate: '2024-01-13',
      status: 'approved',
      documents: 9,
      completeness: 100,
      riskLevel: 'low'
    }
  ];

  const handleReviewApplication = (app: any) => {
    setSelectedApplication(app);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Детальный просмотр</h1>
          <p className="text-neutral-600 mt-1">Детальный анализ и рассмотрение заявлений</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <i className="ri-download-line mr-2"></i>
            Экспорт отчета
          </button>
          <button className="btn-primary">
            <i className="ri-settings-3-line mr-2"></i>
            Настройки просмотра
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-900">{app.applicant}</h3>
                <p className="text-sm text-neutral-600">{app.type}</p>
              </div>
              <StatusBadge 
                status={
                  app.status === 'under_review' ? 'info' :
                  app.status === 'needs_revision' ? 'warning' :
                  app.status === 'approved' ? 'success' : 'error'
                }
                text={
                  app.status === 'under_review' ? 'На рассмотрении' :
                  app.status === 'needs_revision' ? 'Требует доработки' :
                  app.status === 'approved' ? 'Одобрена' : 'Отклонена'
                }
              />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">ID заявки:</span>
                <span className="font-mono text-blue-600">{app.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Дата подачи:</span>
                <span>{app.submittedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Документов:</span>
                <span>{app.documents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Полнота:</span>
                <span className={`font-semibold ${
                  app.completeness >= 90 ? 'text-green-600' :
                  app.completeness >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {app.completeness}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Уровень риска:</span>
                <StatusBadge 
                  status={app.riskLevel === 'low' ? 'success' : app.riskLevel === 'medium' ? 'warning' : 'error'}
                  text={app.riskLevel === 'low' ? 'Низкий' : app.riskLevel === 'medium' ? 'Средний' : 'Высокий'}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>Полнота документов</span>
                <span>{app.completeness}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    app.completeness >= 90 ? 'bg-green-500' :
                    app.completeness >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${app.completeness}%` }}
                ></div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleReviewApplication(app)}
                className="flex-1 btn-primary text-sm"
              >
                <i className="ri-eye-line mr-1"></i>
                Детальный просмотр
              </button>
              <button className="btn-secondary text-sm px-3">
                <i className="ri-download-line"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Детальный просмотр заявки"
        size="large"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Application Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Информация о заявке</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">ID:</span>
                    <span className="font-mono text-blue-600">{selectedApplication.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Заявитель:</span>
                    <span>{selectedApplication.applicant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Тип:</span>
                    <span>{selectedApplication.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Дата подачи:</span>
                    <span>{selectedApplication.submittedDate}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Анализ рисков</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Уровень риска:</span>
                    <StatusBadge 
                      status={selectedApplication.riskLevel === 'low' ? 'success' : selectedApplication.riskLevel === 'medium' ? 'warning' : 'error'}
                      text={selectedApplication.riskLevel === 'low' ? 'Низкий' : selectedApplication.riskLevel === 'medium' ? 'Средний' : 'Высокий'}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Полнота документов:</span>
                    <span className="font-semibold">{selectedApplication.completeness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Количество документов:</span>
                    <span>{selectedApplication.documents}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Документы</h3>
              <div className="space-y-2">
                {['Паспорт', 'Справка о доходах', 'Справка о составе семьи', 'Документы на жилье', 'Справка о недвижимости'].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="ri-file-text-line text-blue-600"></i>
                      <span className="text-sm">{doc}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status="success" text="Загружен" />
                      <button className="text-blue-600 hover:text-blue-800">
                        <i className="ri-eye-line"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Actions */}
            <div className="flex space-x-3 pt-4 border-t border-neutral-200">
              <button className="btn-success">
                <i className="ri-check-line mr-2"></i>
                Одобрить заявку
              </button>
              <button className="btn-warning">
                <i className="ri-edit-line mr-2"></i>
                Требует доработки
              </button>
              <button className="btn-error">
                <i className="ri-close-line mr-2"></i>
                Отклонить заявку
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
