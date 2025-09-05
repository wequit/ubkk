'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { regions, incomeCategories } from '@/lib/mockData';
import { calculateBenefit, validateFamilyComposition, formatCurrency } from '@/lib/benefitCalculator';

export default function NewApplication() {
  const [language, setLanguage] = useState('ru');
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Основная информация
    fullName: '',
    personalId: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    region: '',
    
    // Члены семьи
    familyMembers: [
      { name: '', age: '', relation: '', income: 0 }
    ],
    
    // Доходы
    incomes: {} as Record<string, number>,
    
    // Личное подсобное хозяйство - земельные участки
    landPlots: [
      { type: 'irrigated' as const, area: 0 }
    ],
    
    // Личное подсобное хозяйство - скот
    livestock: {
      cows: 0,
      horses: 0,
      sheep: 0,
      goats: 0,
      pigs: 0,
      poultry: 0,
      other: 0
    },
    
    // Активы семьи
    assets: {
      hasCar: false,
      hasTractor: false,
      hasTruck: false,
      carAge: undefined as number | undefined
    },
    
    // Документы
    documents: [] as File[],
    
    // Согласие
    consent: false
  });

  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = translations[language as keyof typeof translations];

  const steps = [
    { id: 1, name: language === 'ru' ? 'Основная информация' : 'Негизги маалымат', icon: 'ri-user-line' },
    { id: 2, name: language === 'ru' ? 'Состав семьи' : 'Үй-бүлөлүк курам', icon: 'ri-team-line' },
    { id: 3, name: language === 'ru' ? 'Доходы' : 'Кирешелер', icon: 'ri-money-dollar-circle-line' },
    { id: 4, name: language === 'ru' ? 'Подсобное хозяйство' : 'Жардамчы чарба', icon: 'ri-home-line' },
    { id: 5, name: language === 'ru' ? 'Документы' : 'Документтер', icon: 'ri-file-text-line' },
    { id: 6, name: language === 'ru' ? 'Расчет' : 'Эсептөө', icon: 'ri-calculator-line' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFamilyMemberChange = (index: number, field: string, value: any) => {
    const updatedMembers = [...formData.familyMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      familyMembers: updatedMembers
    }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: '', age: '', relation: '', income: 0 }]
    }));
  };

  const removeFamilyMember = (index: number) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleIncomeChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      incomes: {
        ...prev.incomes,
        [category]: value
      }
    }));
  };

  // Функции для работы с земельными участками
  const handleLandPlotChange = (index: number, field: string, value: any) => {
    const updatedPlots = [...formData.landPlots];
    updatedPlots[index] = {
      ...updatedPlots[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      landPlots: updatedPlots
    }));
  };

  const addLandPlot = () => {
    setFormData(prev => ({
      ...prev,
      landPlots: [...prev.landPlots, { type: 'irrigated' as const, area: 0 }]
    }));
  };

  const removeLandPlot = (index: number) => {
    if (formData.landPlots.length > 1) {
      setFormData(prev => ({
        ...prev,
        landPlots: prev.landPlots.filter((_, i) => i !== index)
      }));
    }
  };

  // Функции для работы со скотом
  const handleLivestockChange = (type: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      livestock: {
        ...prev.livestock,
        [type]: value
      }
    }));
  };

  // Функции для работы с активами
  const handleAssetChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [field]: value
      }
    }));
  };

  const calculateBenefitAmount = async () => {
    setIsCalculating(true);
    
    // Валидация данных
    const validation = validateFamilyComposition(
      formData.familyMembers.map(member => ({
        name: member.name,
        age: parseInt(member.age) || 0,
        relation: member.relation,
        income: member.income
      }))
    );

    if (!validation.valid) {
      alert(language === 'ru' ? 'Ошибка валидации: ' + validation.errors.join(', ') : 'Валидация катасы: ' + validation.errors.join(', '));
      setIsCalculating(false);
      return;
    }

    // Расчет общего дохода
    const totalIncome = Object.values(formData.incomes).reduce((sum, income) => sum + income, 0);

    // Расчет пособия с учетом ЛПХ
    const result = calculateBenefit(
      formData.familyMembers.map(member => ({
        name: member.name,
        age: parseInt(member.age) || 0,
        relation: member.relation,
        income: member.income
      })),
      formData.region,
      totalIncome,
      formData.landPlots,
      formData.livestock,
      formData.assets
    );

    setCalculation(result);
    setIsCalculating(false);
  };

  const submitApplication = async () => {
    if (!calculation?.eligible) {
      alert(language === 'ru' ? 'Семья не соответствует критериям для получения пособия' : 'Үй-бүлө жөлөкпул алуу критерийлерине жооп бербейт');
      return;
    }

    // Здесь была бы отправка данных на сервер
    alert(language === 'ru' ? 'Заявление успешно отправлено!' : 'Арыз ийгиликтүү жөнөтүлдү!');
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-government-line text-2xl text-white"></i>
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-red-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/citizen" className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <i className="ri-government-line text-2xl text-white"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {language === 'ru' ? 'Новое заявление' : 'Жаңы арыз'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {language === 'ru' ? 'Подача заявления на пособие «Үй-бүлөгө көмөк»' : '«Үй-бүлөгө көмөк» жөлөкпулуна арыз берүү'}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'ru' ? 'Заявление на пособие «Үй-бүлөгө көмөк»' : '«Үй-бүлөгө көмөк» жөлөкпулуна арыз'}
              </h2>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <i className={step.icon}></i>
                  </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  </div>
                  {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 ${
                        currentStep > step.id ? 'bg-red-600' : 'bg-gray-200'
                      }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ru' ? 'Основная информация заявителя' : 'Арыз берүүчүнүн негизги маалыматы'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'ФИО' : 'Аты-жөнү'}
                      </label>
                      <input
                        type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={language === 'ru' ? 'Введите полное имя' : 'Толук атын киргизиңиз'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'ИИН/Паспорт' : 'ЖШ/Паспорт'}
                      </label>
                      <input
                        type="text"
                      value={formData.personalId}
                      onChange={(e) => handleInputChange('personalId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={language === 'ru' ? 'Введите ИИН или номер паспорта' : 'ЖШ же паспорт номерин киргизиңиз'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Дата рождения' : 'Туулган күнү'}
                      </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                  </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Телефон' : 'Телефон'}
                      </label>
                      <input
                        type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+996 XXX XXX XXX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Email (необязательно)' : 'Email (милдеттүү эмес)'}
                      </label>
                      <input
                        type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Регион проживания' : 'Турак жай аймагы'}
                      </label>
                      <select
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">{language === 'ru' ? 'Выберите регион' : 'Аймакты тандаңыз'}</option>
                      {regions.map(region => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ru' ? 'Адрес проживания' : 'Турак жай дареги'}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={language === 'ru' ? 'Введите полный адрес' : 'Толук дарегин киргизиңиз'}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Family Members */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ru' ? 'Состав семьи' : 'Үй-бүлөлүк курам'}
                </h3>
                    <button
                      onClick={addFamilyMember}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-flex items-center whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-add-line mr-2"></i>
                      {language === 'ru' ? 'Добавить члена семьи' : 'Үй-бүлө мүчөсүн кошуу'}
                    </button>
                  </div>

                <div className="space-y-4">
                  {formData.familyMembers.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          {language === 'ru' ? `Член семьи ${index + 1}` : `Үй-бүлө мүчөсү ${index + 1}`}
                        </h4>
                        {formData.familyMembers.length > 1 && (
                          <button
                            onClick={() => removeFamilyMember(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
              <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'ru' ? 'ФИО' : 'Аты-жөнү'}
                        </label>
                        <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder={language === 'ru' ? 'Введите имя' : 'Атын киргизиңиз'}
                          />
                  </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'ru' ? 'Возраст' : 'Жашы'}
                        </label>
                        <input
                          type="number"
                            value={member.age}
                            onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            max="120"
                          />
                  </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'ru' ? 'Отношение' : 'Карым-катыш'}
                        </label>
                          <select
                            value={member.relation}
                            onChange={(e) => handleFamilyMemberChange(index, 'relation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">{language === 'ru' ? 'Выберите' : 'Тандаңыз'}</option>
                            <option value="mother">{language === 'ru' ? 'Мать' : 'Эне'}</option>
                            <option value="father">{language === 'ru' ? 'Отец' : 'Ата'}</option>
                            <option value="child">{language === 'ru' ? 'Ребенок' : 'Бала'}</option>
                            <option value="grandmother">{language === 'ru' ? 'Бабушка' : 'Эже'}</option>
                            <option value="grandfather">{language === 'ru' ? 'Дедушка' : 'Ата'}</option>
                            <option value="other">{language === 'ru' ? 'Другое' : 'Башка'}</option>
                          </select>
                  </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'ru' ? 'Доход (сом/мес)' : 'Киреше (сом/ай)'}
                        </label>
                        <input
                          type="number"
                            value={member.income}
                            onChange={(e) => handleFamilyMemberChange(index, 'income', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                        />
                      </div>
                      </div>
                    </div>
                  ))}
                  </div>
                      </div>
            )}

            {/* Step 3: Income Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ru' ? 'Детальная информация о доходах' : 'Кирешелер жөнүндө деталдуу маалымат'}
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <i className="ri-information-line mr-2"></i>
                    {language === 'ru' ? 'Информация о доходах' : 'Кирешелер жөнүндө маалымат'}
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {language === 'ru' 
                      ? 'Укажите все источники доходов семьи. В разделе "Подсобное хозяйство" детально укажите доходы от каждого вида скота и земледелия.'
                      : 'Үй-бүлөнүн бардык киреше булактарын көрсөтүңүз. "Жардамчы чарба" бөлүмүндө малдын ар бир түрүнөн жана жер иштетүүдөн кирешелерди деталдуу көрсөтүңүз.'}
                  </p>
                  <div className="text-xs text-blue-600">
                    <p className="mb-1">
                      <strong>{language === 'ru' ? 'Подсобное хозяйство:' : 'Жардамчы чарба:'}</strong>
                      {language === 'ru' 
                        ? ' КРС, лошади, овцы, козы, свиньи, птица, пчеловодство, рыбоводство'
                        : ' Уй, ат, кой, эчки, чочко, чымчык, аарычылык, балыкчылык'}
                    </p>
                    <p>
                      <strong>{language === 'ru' ? 'Землевладение:' : 'Жер ээлик:'}</strong>
                      {language === 'ru' 
                        ? ' Орошаемое, богарное земледелие, приусадебный участок'
                        : ' Сугарылган, богардык жер иштетүү, үй тиричилиги'}
                    </p>
                  </div>
                </div>
                
                {/* Группировка по категориям */}
                <div className="space-y-6">
                  {/* Основной доход */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'I. Основной доход' : 'I. Негизги киреше'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'primary').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Образование */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'II. Образование' : 'II. Билим берүү'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'education').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Прочие доходы */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'III. Прочие доходы' : 'III. Башка кирешелер'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'other').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Предпринимательская деятельность */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'IV. Предпринимательская деятельность' : 'IV. Ишкердик ишмердүүлүк'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'business').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Землевладение */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'V. Землевладение' : 'V. Жер ээлик'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'land').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Подсобное хозяйство */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'VI. Подсобное хозяйство' : 'VI. Жардамчы чарба'}
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'farming').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Финансовые инструменты */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">
                      {language === 'ru' ? 'VII. Финансовые инструменты' : 'VII. Финансылык куралдар'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {incomeCategories.filter(cat => cat.category === 'financial').map(category => (
                        <div key={category.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {category.name}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.incomes[category.id] || 0}
                              onChange={(e) => handleIncomeChange(category.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className={`${category.icon} text-gray-400`}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {language === 'ru' ? 'Общий доход семьи:' : 'Үй-бүлөнүн жалпы кирешеси:'}
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(Object.values(formData.incomes).reduce((sum, income) => sum + income, 0))}
                        </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Household Farming */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ru' ? 'Личное подсобное хозяйство' : 'Жеке жардамчы чарба'}
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <i className="ri-information-line mr-2"></i>
                    {language === 'ru' ? 'Важная информация' : 'Маанилүү маалымат'}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {language === 'ru' 
                      ? 'При расчете пособия учитываются доходы от личного подсобного хозяйства. Наличие значительных активов (автомобиль, трактор) может исключить право на пособие.'
                      : 'Жөлөкпулду эсептөөдө жеке жардамчы чарбадан кирешелер эске алынат. Маанилүү активдердин (автомобиль, трактор) болушу жөлөкпулга укукту жокко чыгара алат.'}
                  </p>
                </div>

                {/* Земельные участки */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    {language === 'ru' ? 'Земельные участки' : 'Жер учактары'}
                  </h4>
                  <div className="space-y-3">
                    {formData.landPlots.map((plot, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <select
                          value={plot.type}
                          onChange={(e) => handleLandPlotChange(index, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="irrigated">{language === 'ru' ? 'Орошаемый' : 'Сугарылган'}</option>
                          <option value="rain_fed">{language === 'ru' ? 'Богарный' : 'Богардык'}</option>
                          <option value="household">{language === 'ru' ? 'Приусадебный' : 'Үй тиричилиги'}</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={plot.area}
                          onChange={(e) => handleLandPlotChange(index, 'area', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 w-24"
                        />
                        <span className="text-sm text-gray-600">
                          {language === 'ru' ? 'соток' : 'соток'}
                        </span>
                        {formData.landPlots.length > 1 && (
                          <button
                            onClick={() => removeLandPlot(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addLandPlot}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <i className="ri-add-line mr-1"></i>
                      {language === 'ru' ? 'Добавить участок' : 'Учакта кошуу'}
                    </button>
                  </div>
                </div>

                {/* Скот */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    {language === 'ru' ? 'Скот' : 'Мал'}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Коровы' : 'Уйлар'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.cows}
                        onChange={(e) => handleLivestockChange('cows', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Лошади' : 'Аттар'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.horses}
                        onChange={(e) => handleLivestockChange('horses', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Овцы' : 'Койлор'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.sheep}
                        onChange={(e) => handleLivestockChange('sheep', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Козы' : 'Эчкилер'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.goats}
                        onChange={(e) => handleLivestockChange('goats', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Свиньи' : 'Чочколор'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.pigs}
                        onChange={(e) => handleLivestockChange('pigs', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ru' ? 'Птица' : 'Чымчыктар'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.livestock.poultry}
                        onChange={(e) => handleLivestockChange('poultry', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Активы семьи */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    {language === 'ru' ? 'Активы семьи' : 'Үй-бүлөнүн активдери'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.assets.hasCar}
                        onChange={(e) => handleAssetChange('hasCar', e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'ru' ? 'Есть автомобиль' : 'Автомобиль бар'}
                      </label>
                      {formData.assets.hasCar && (
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={formData.assets.carAge || ''}
                          onChange={(e) => handleAssetChange('carAge', parseInt(e.target.value) || undefined)}
                          placeholder="0"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 w-20"
                        />
                      )}
                      {formData.assets.hasCar && (
                        <span className="text-sm text-gray-600">
                          {language === 'ru' ? 'лет' : 'жаш'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.assets.hasTractor}
                        onChange={(e) => handleAssetChange('hasTractor', e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'ru' ? 'Есть трактор' : 'Трактор бар'}
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.assets.hasTruck}
                        onChange={(e) => handleAssetChange('hasTruck', e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'ru' ? 'Есть грузовик' : 'Жүк ташуучу машина бар'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ru' ? 'Прикрепление документов' : 'Документтерди тиркөө'}
                </h3>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 mb-2">
                      {language === 'ru' ? 'Перетащите документы сюда или нажмите для выбора' : 'Документтерди бул жерге сүйрөп таштаңыз же тандау үчүн басыңыз'}
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 whitespace-nowrap cursor-pointer">
                      {language === 'ru' ? 'Выбрать файлы' : 'Файлдарды тандау'}
                              </button>
                            </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      {language === 'ru' ? 'Необходимые документы:' : 'Керектүү документтер:'}
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• {language === 'ru' ? 'Паспорт или удостоверение личности' : 'Паспорт же жеке кимдик'}</li>
                      <li>• {language === 'ru' ? 'Свидетельства о рождении детей' : 'Балдардын туулган күбөлүктөрү'}</li>
                      <li>• {language === 'ru' ? 'Справки о доходах всех членов семьи' : 'Үй-бүлөнүн бардык мүчөлөрүнүн кирешелер жөнүндө справкалары'}</li>
                      <li>• {language === 'ru' ? 'Справка о составе семьи' : 'Үй-бүлөлүк курам жөнүндө справка'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Calculation and Submission */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ru' ? 'Расчет пособия и отправка заявления' : 'Жөлөкпулду эсептөө жана арызды жөнөтүү'}
                </h3>
                
                <div className="flex justify-center">
                  <button
                    onClick={calculateBenefitAmount}
                    disabled={isCalculating}
                    className={`px-6 py-3 rounded-lg inline-flex items-center whitespace-nowrap cursor-pointer ${
                      isCalculating 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isCalculating ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin"></i>
                        {language === 'ru' ? 'Расчет...' : 'Эсептөө...'}
                      </>
                    ) : (
                      <>
                        <i className="ri-calculator-line mr-2"></i>
                        {language === 'ru' ? 'Рассчитать пособие' : 'Жөлөкпулду эсептөө'}
                      </>
                    )}
                  </button>
              </div>
                
                {calculation && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {language === 'ru' ? 'Результат расчета:' : 'Эсептөөнүн жыйынтыгы:'}
                    </h4>

                    {calculation.eligible ? (
                          <div className="space-y-3">
                        <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                            {language === 'ru' ? 'Доход на человека:' : 'Адамга киреше:'}
                              </span>
                          <span className="font-semibold">{formatCurrency(calculation.perCapitaIncome)}</span>
                            </div>
                            
                            {/* Информация о ЛПХ */}
                            {(calculation.landIncome > 0 || calculation.livestockIncome > 0) && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                                <h5 className="font-medium text-blue-900 text-sm">
                                  {language === 'ru' ? 'Учет личного подсобного хозяйства:' : 'Жеке жардамчы чарбанын эсеби:'}
                                </h5>
                                {calculation.landIncome > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">
                                      {language === 'ru' ? 'Доход от земли:' : 'Жерден киреше:'}
                                    </span>
                                    <span className="font-medium">{formatCurrency(calculation.landIncome)}</span>
                                  </div>
                                )}
                                {calculation.livestockIncome > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">
                                      {language === 'ru' ? 'Доход от скота:' : 'Малдан киреше:'}
                                    </span>
                                    <span className="font-medium">{formatCurrency(calculation.livestockIncome)}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-blue-700">
                                    {language === 'ru' ? 'МРС на человека:' : 'Адамга МРС:'}
                                  </span>
                                  <span className="font-medium">{calculation.livestockPerPerson.toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                        <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                            {language === 'ru' ? 'Детей до 16 лет:' : '16га чейинки балдар:'}
                              </span>
                          <span className="font-semibold">{calculation.childrenUnder16}</span>
                            </div>
                        <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                            {language === 'ru' ? 'Базовая сумма:' : 'Негизги сумма:'}
                              </span>
                          <span className="font-semibold">{formatCurrency(calculation.baseBenefit)}</span>
                            </div>
                        <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                            {language === 'ru' ? 'Районный коэффициент:' : 'Аймактык коэффициент:'}
                                </span>
                          <span className="font-semibold">{calculation.regionalCoefficient}x</span>
                              </div>
                        {calculation.borderBonus > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">
                              {language === 'ru' ? 'Приграничная надбавка:' : 'Чек ара кошумча:'}
                            </span>
                            <span className="font-semibold">{formatCurrency(calculation.borderBonus)}</span>
                          </div>
                        )}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">
                              {language === 'ru' ? 'Итого пособие:' : 'Жалпы жөлөкпул:'}
                            </span>
                            <span className="text-2xl font-bold text-green-600">
                              {formatCurrency(calculation.totalMonthlyBenefit)}
                            </span>
                        </div>
                      </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <div className="flex items-center">
                            <i className="ri-check-line text-green-600 mr-2"></i>
                            <span className="text-green-800 font-medium">
                              {language === 'ru' ? 'Семья соответствует критериям для получения пособия!' : 'Үй-бүлө жөлөкпул алуу критерийлерине жооп берет!'}
                      </span>
                    </div>
                      </div>
                    </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <i className="ri-close-line text-red-600 mr-2"></i>
                          <span className="text-red-800 font-medium">
                            {calculation.reason}
                      </span>
                    </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => handleInputChange('consent', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label className="ml-3 text-sm text-blue-800">
                      {language === 'ru' 
                        ? 'Я согласен на обработку персональных данных и подтверждаю достоверность предоставленной информации'
                        : 'Мен жеке маалыматтарды иштетүүгө макулмун жана берилген маалыматтардын чындыгын ырастайм'
                      }
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg inline-flex items-center whitespace-nowrap cursor-pointer ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <i className="ri-arrow-left-line mr-2"></i>
                {language === 'ru' ? 'Назад' : 'Артка'}
              </button>

              {currentStep < 6 ? (
                  <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 inline-flex items-center whitespace-nowrap cursor-pointer"
                >
                  {language === 'ru' ? 'Далее' : 'Кийинки'}
                    <i className="ri-arrow-right-line ml-2"></i>
                  </button>
              ) : (
                <button
                  onClick={submitApplication}
                  disabled={!calculation?.eligible || !formData.consent}
                  className={`px-6 py-3 rounded-lg inline-flex items-center whitespace-nowrap cursor-pointer ${
                    !calculation?.eligible || !formData.consent
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  {language === 'ru' ? 'Отправить заявление' : 'Арызды жөнөтүү'}
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
