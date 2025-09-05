'use client';

import { useState } from 'react';
import Modal from './Modal';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSaveDecision: (decision: 'approved' | 'rejected', reason?: string, comment?: string) => void;
}

export default function DecisionModal({ isOpen, onClose, applicationId, onSaveDecision }: DecisionModalProps) {
  const [selectedDecision, setSelectedDecision] = useState<'approved' | 'rejected' | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const handleSave = () => {
    if (selectedDecision) {
      onSaveDecision(selectedDecision, selectedReason, comment);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDecision(null);
    setSelectedReason('');
    setComment('');
    onClose();
  };

  const handleDecisionSelect = (decision: 'approved' | 'rejected') => {
    setSelectedDecision(decision);
    if (decision === 'approved') {
      setSelectedReason('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Принятие решения по заявке" size="lg">
      <div className="space-y-4 md:space-y-6">
        {/* Decision Tools */}
        <div>
          <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Инструменты принятия решений</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <button 
              onClick={() => handleDecisionSelect('approved')}
              className={`px-4 md:px-6 py-3 md:py-4 rounded-lg transition-colors flex items-center justify-center ${
                selectedDecision === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              <i className="ri-check-line mr-2 text-lg md:text-xl"></i>
              <div className="text-left">
                <div className="font-semibold text-sm md:text-base">Одобрить</div>
                <div className="text-xs md:text-sm opacity-90">Все требования выполнены</div>
              </div>
            </button>

            <button 
              onClick={() => handleDecisionSelect('rejected')}
              className={`px-4 md:px-6 py-3 md:py-4 rounded-lg transition-colors flex items-center justify-center ${
                selectedDecision === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              <i className="ri-close-line mr-2 text-lg md:text-xl"></i>
              <div className="text-left">
                <div className="font-semibold text-sm md:text-base">Отклонить</div>
                <div className="text-xs md:text-sm opacity-90">С указанием причины</div>
              </div>
            </button>
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <h5 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Коды причин отклонения:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                name="reason" 
                value="income_exceeded" 
                checked={selectedReason === 'income_exceeded'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="text-red-600" 
              />
              <span>R001: Превышение ГМД</span>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                name="reason" 
                value="incomplete_docs" 
                checked={selectedReason === 'incomplete_docs'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="text-red-600" 
              />
              <span>R002: Неполные документы</span>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                name="reason" 
                value="false_info" 
                checked={selectedReason === 'false_info'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="text-red-600" 
              />
              <span>R003: Ложная информация</span>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                name="reason" 
                value="duplicate" 
                checked={selectedReason === 'duplicate'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="text-red-600" 
              />
              <span>R004: Дублирование</span>
            </div>
          </div>
        </div>

        {/* Specialist Comment */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Комментарий специалиста:
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            placeholder="Дополнительные комментарии..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base"
          >
            Отмена
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedDecision || (selectedDecision === 'rejected' && !selectedReason)}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Сохранить решение
          </button>
        </div>
      </div>
    </Modal>
  );
}
