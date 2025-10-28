import React, { useState } from 'react';
import { CheckCircleIcon, TrophyIcon } from './Icons';

type Currency = 'toman' | 'dollar';

const PriceToggle: React.FC<{ currency: Currency; setCurrency: (c: Currency) => void }> = ({ currency, setCurrency }) => {
  return (
    <div className="bg-gray-100 dark:bg-slate-700 p-0.5 rounded-md flex items-center self-center my-4">
      <button
        type="button"
        onClick={() => setCurrency('toman')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${currency === 'toman' ? 'bg-white dark:bg-slate-600 shadow-sm font-semibold' : 'text-gray-500 dark:text-slate-300'}`}
      >
        تومان
      </button>
      <button
        type="button"
        onClick={() => setCurrency('dollar')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${currency === 'dollar' ? 'bg-white dark:bg-slate-600 shadow-sm font-semibold' : 'text-gray-500 dark:text-slate-300'}`}
      >
        $
      </button>
    </div>
  );
};

const PlanCard: React.FC<{
  title: string;
  price: { toman: string; dollar: string };
  priceDetails: string;
  storage: string;
  features: string[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  isCurrent?: boolean;
  isPopular?: boolean;
}> = ({ title, price, priceDetails, storage, features, currency, setCurrency, isCurrent = false, isPopular = false }) => {
  const isFree = price.toman === "رایگان";

  return (
    <div className={`p-6 rounded-xl border-2 flex flex-col bg-white dark:bg-slate-800 ${isPopular ? 'border-brand-primary' : 'border-gray-200 dark:border-slate-700'}`}>
      {isPopular && <span className="text-xs font-bold text-white bg-brand-primary rounded-full px-3 py-1 self-start -mt-9 mx-auto">محبوب‌ترین</span>}
      <h3 className="text-xl font-bold text-center text-brand-text dark:text-slate-100">{title}</h3>

      {!isFree && <PriceToggle currency={currency} setCurrency={setCurrency} />}
      
      <div className={`text-center ${isFree ? 'my-4 mt-11' : 'my-4'}`}>
        <span className="text-4xl font-extrabold text-brand-text dark:text-slate-50">{currency === 'toman' ? price.toman : price.dollar}</span>
        <span className="text-brand-subtext dark:text-slate-400">{priceDetails}</span>
      </div>

      <div className="text-center mb-6">
        <span className="font-bold text-brand-text dark:text-slate-200">{storage}</span>
        <p className="text-xs text-brand-subtext dark:text-slate-500">فضای ذخیره‌سازی</p>
      </div>
      
      <ul className="space-y-3 text-brand-text dark:text-slate-300 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        disabled={isCurrent}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${isCurrent ? 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' : isPopular ? 'bg-brand-primary text-white hover:bg-blue-700' : 'bg-white dark:bg-slate-800 border-2 border-brand-primary text-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700'}`}
      >
        {isCurrent ? 'پلن فعلی شما' : 'انتخاب پلن'}
      </button>
    </div>
  );
};

const UpgradePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'organization'>('personal');
  const [currency, setCurrency] = useState<Currency>('toman');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-brand-text dark:text-slate-100">پلن خود را انتخاب کنید</h1>
        <p className="text-brand-subtext dark:text-slate-400 mt-2">بهترین پلن را برای نیازهای خود یا تیمتان انتخاب کنید.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-gray-200 dark:bg-slate-700 p-1 rounded-xl flex items-center">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'personal' ? 'bg-white dark:bg-slate-600 shadow' : 'text-gray-600 dark:text-slate-300'}`}
          >
            فردی
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'organization' ? 'bg-white dark:bg-slate-600 shadow' : 'text-gray-600 dark:text-slate-300'}`}
          >
            سازمانی
          </button>
        </div>
      </div>

      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-fade-in">
          <PlanCard
            title="طرح رایگان"
            price={{ toman: "رایگان", dollar: "Free" }}
            priceDetails=""
            storage="۲۰۰ مگابایت"
            features={[
              "دسترسی به ویوهای محدود (کانبان، جدول، و تقویم)",
              "استفاده از فرم‌ها تا ۴ عدد در ماه",
              "بدون تحلیل هوشمند",
              "بدون اتوماسیون و خطاگر‌یزی نرم‌افزار",
            ]}
            isCurrent={true}
            currency={currency}
            setCurrency={setCurrency}
          />
          <PlanCard
            title="طرح پلاس"
            price={{ toman: "200,000 تومان", dollar: "5$" }}
            priceDetails="/ ماهانه"
            storage="۱۰ گیگابایت"
            features={[
              "دسترسی کامل به همه ویوها (لیستی، گانت، تایم‌لاین و...)",
              "امکان تحلیل‌های هوشمند (با پرداخت هزینه مدل AI)",
              "استفاده از فرم‌ها تا ۱۰۰ عدد در ماه",
              "اتوماسیون، خطاگر‌یزی و پردازش هوشمند",
              "شخصی‌سازی محیط، تم‌ها و داشبوردها",
              "پشتیبانی سریع‌تر",
            ]}
            isPopular={true}
            currency={currency}
            setCurrency={setCurrency}
          />
        </div>
      )}

      {activeTab === 'organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <PlanCard
            title="رایگان"
            price={{ toman: "رایگان", dollar: "Free" }}
            priceDetails=" برای تیم‌های کوچک"
            storage="۲۰۰ مگابایت"
            features={[
              "مناسب تیم‌های کوچک و تستی",
              "دسترسی فقط به ویوهای پایه (کانبان، جدول، تقویم)",
              "استفاده از فرم‌ها تا ۴ عدد در ماه",
            ]}
            isCurrent={true}
            currency={currency}
            setCurrency={setCurrency}
          />
          <PlanCard
            title="پیشرفته"
            price={{ toman: "200,000 تومان", dollar: "5$" }}
            priceDetails="/ کاربر / ماه"
            storage="۱۰ گیگابایت"
            features={[
              "دسترسی کامل به همه ویوها",
              "تحلیل‌های هوشمند (با هزینه جداگانه شارژ مدل)",
              "اتوماسیون سازمانی و کنترل نقش‌ها",
              "گزارش‌های پیشرفته و داشبورد مدیریتی",
              "پشتیبانی تیمی با اولویت بالا",
            ]}
            isPopular={true}
            currency={currency}
            setCurrency={setCurrency}
          />
           <PlanCard
            title="هوشمند"
            price={{ toman: "500,000 تومان", dollar: "10$" }}
            priceDetails="/ کاربر / ماه"
            storage="200 گیگابایت"
            features={[
              "شامل تمام امکانات نسخه پیشرفته",
              "هزینه مدل هوش مصنوعی رایگان است",
              "داشبوردهای تحلیلی هوشمند و خودکار",
              "پیشنهادهای بهینه‌سازی عملکرد با AI",
              "خودکارسازی فرایندها در سطح تیمی",
              "استفاده نامحدود از فرم‌ها",
            ]}
            currency={currency}
            setCurrency={setCurrency}
          />
        </div>
      )}
    </div>
  );
};

export default UpgradePage;
