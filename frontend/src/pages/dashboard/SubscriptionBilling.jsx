import { useState, useEffect } from 'react';
import assets from '../../assets';
import { getSubscription, changeSubscriptionPlan } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function SubscriptionBilling() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showPlans, setShowPlans] = useState(true);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const res = await getSubscription();
      setData(res);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handlePlanChangeConfirm = async () => {
    if (!pendingPlan) return;
    setActionLoading(true);
    try {
      const res = await changeSubscriptionPlan(pendingPlan.plan_code);
      showToast(res.message || 'Subscription plan updated successfully!', 'success');
      setPendingPlan(null);
      await fetchSubscriptionData();
    } catch (err) {
      showToast(err.message || 'Failed to update plan.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0E3F39] animate-spin" />
        <p className="text-sm font-semibold font-['Work_Sans'] text-[#0E3F39]">Loading subscription details...</p>
      </div>
    );
  }

  const sub = data?.subscription;
  const currentPlanCode = sub?.plan?.plan_code || 'ENTERPRISE';
  const currentPlanName = sub?.plan?.plan_name || 'Enterprise';
  const monthlyPriceFormatted = sub?.plan?.monthly_price 
    ? `₱${Number(sub.plan.monthly_price).toLocaleString('en-US')}` 
    : '₱7,500';
  
  // Format next billing / renewal date e.g. "August 10, 2026"
  const renewDateRaw = sub?.next_billing_date || sub?.end_date || '2026-08-10';
  const renewDateFormatted = new Date(renewDateRaw).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const stats = data?.stats || {
    dentists_active: 3,
    dentists_limit: 'Unlimited',
    staff_active: 5,
    staff_limit: 10,
    patients_total: 312,
    retention: '3 years'
  };

  return (
    <div className="w-full min-h-full bg-[#F0F4F3] p-4 sm:p-6 flex flex-col items-start gap-4 font-['Work_Sans',sans-serif]">
      {/* ── TOP HERO CARD: Current Plan Summary (node 787:19895) ── */}
      <div className="w-full bg-white border-[#0E3F39] border-[1.33px] rounded-[12px] p-4 sm:p-[22.5px] flex flex-col md:flex-row justify-between items-start gap-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        {/* Left column */}
        <div className="flex-1 flex flex-col items-start w-full">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-[11.25px]">
            <span className="font-['Work_Sans'] font-bold text-[11.25px] leading-[15px] tracking-[0.56px] text-[#8A9DA0] uppercase">
              Current Plan
            </span>
            <span className="bg-[#D4ECE9] text-[#0E3F39] font-['Work_Sans'] font-bold text-[11.25px] leading-[15px] px-[9.375px] py-[2px] rounded-full">
              {currentPlanName}
            </span>
            <span className="bg-[#16A34A] text-white font-['Work_Sans'] font-bold text-[11.25px] leading-[15px] px-[9.375px] py-[2px] rounded-full">
              {sub?.status === 'active' || !sub?.status ? 'Active' : sub.status}
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-['Work_Sans'] font-bold text-[28px] sm:text-[28.125px] leading-[34px] text-[#1E2939]">
              {monthlyPriceFormatted}
            </span>
            <span className="font-['Work_Sans'] font-normal text-[13.125px] leading-[19px] text-[#8A9DA0]">
              /month
            </span>
          </div>

          {/* Renewal Date */}
          <p className="mt-1 font-['Work_Sans'] font-normal text-[13.125px] leading-[19px] text-[#5A7A76]">
            Renews on {renewDateFormatted}
          </p>

          {/* 4 Stat Pills Grid (Dentists, Staff, Patients, Retention) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-[11.25px] mt-4">
            {/* Stat 1: Dentists */}
            <div className="bg-[#F0F4F3] rounded-[8px] p-[11.25px] flex flex-col">
              <div className="flex items-center gap-1.5">
                <img src={assets.iconSubUsers} alt="" className="w-3 h-3 object-contain" />
                <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                  Dentists
                </span>
              </div>
              <p className="font-['Work_Sans'] font-semibold text-[13.125px] leading-[19px] text-[#1E2939] mt-1">
                {stats.dentists_active} of {stats.dentists_limit === 'Unlimited' ? 'unlimited' : `${stats.dentists_limit} active`}
              </p>
            </div>

            {/* Stat 2: Staff */}
            <div className="bg-[#F0F4F3] rounded-[8px] p-[11.25px] flex flex-col">
              <div className="flex items-center gap-1.5">
                <img src={assets.iconSubUsers} alt="" className="w-3 h-3 object-contain" />
                <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                  Staff
                </span>
              </div>
              <p className="font-['Work_Sans'] font-semibold text-[13.125px] leading-[19px] text-[#1E2939] mt-1">
                {stats.staff_active} of {stats.staff_limit === 'Unlimited' ? 'unlimited' : `${stats.staff_limit} seats`}
              </p>
            </div>

            {/* Stat 3: Patients */}
            <div className="bg-[#F0F4F3] rounded-[8px] p-[11.25px] flex flex-col">
              <div className="flex items-center gap-1.5">
                <img src={assets.iconSubPatientsCount} alt="" className="w-3 h-3 object-contain" />
                <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                  Patients
                </span>
              </div>
              <p className="font-['Work_Sans'] font-semibold text-[13.125px] leading-[19px] text-[#1E2939] mt-1">
                {stats.patients_total} total
              </p>
            </div>

            {/* Stat 4: Retention */}
            <div className="bg-[#F0F4F3] rounded-[8px] p-[11.25px] flex flex-col">
              <div className="flex items-center gap-1.5">
                <img src={assets.iconSubRetention} alt="" className="w-3 h-3 object-contain" />
                <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                  Retention
                </span>
              </div>
              <p className="font-['Work_Sans'] font-semibold text-[13.125px] leading-[19px] text-[#1E2939] mt-1">
                {stats.retention}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Billed monthly badge + toggle button */}
        <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto h-full self-stretch shrink-0 gap-3">
          <div className="bg-[#F0F4F3] flex items-center gap-1.5 px-[11.25px] py-[5.625px] rounded-[8px]">
            <img src={assets.iconSubCalendarCard} alt="" className="w-3.5 h-3.5 object-contain" />
            <span className="font-['Work_Sans'] font-normal text-[11.25px] leading-[15px] text-[#5A7A76]">
              Billed monthly
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPlans(!showPlans)}
            className="flex items-center gap-1.5 text-[#0E3F39] hover:opacity-80 transition-opacity cursor-pointer text-[11.25px] font-['Work_Sans'] font-semibold leading-[15px]"
          >
            <span>{showPlans ? 'Hide all plans' : 'View all plans'}</span>
            <div className={`transition-transform duration-200 ${showPlans ? 'rotate-180' : 'rotate-0'}`}>
              <img src={assets.iconSubChevronDown} alt="" className="w-3.5 h-3.5 object-contain" />
            </div>
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE SECTION: Change Plan & Pricing Cards ── */}
      {showPlans && (
        <div className="w-full flex flex-col gap-6 pt-2 animate-in fade-in duration-200">
          <div>
            <h3 className="font-['Work_Sans'] font-bold text-[13.125px] leading-[19px] text-[#1E2939] tracking-normal">
              Change Plan
            </h3>
          </div>

          {/* 3 Pricing Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-[15px] items-stretch">
            
            {/* 1. Basic Plan Card */}
            <div className="bg-white border-[1.33px] border-black/10 rounded-[12px] p-[18.75px] flex flex-col justify-between shadow-[0px_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-[#E0E7FF] text-[#3730A3] font-['Work_Sans'] font-semibold text-[11.25px] px-[7.5px] py-[2px] rounded-full">
                    Basic
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-['Work_Sans'] text-[#1E2939]">
                    <span className="font-bold text-[22.5px] leading-[30px]">₱990</span>
                    <span className="font-normal text-[11.25px] leading-[15px] text-[#8A9DA0]">/month</span>
                  </p>
                  <p className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76] mt-1">
                    For small clinics just getting started
                  </p>
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      1 dentist
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      2 staff seats
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      100 patients/month
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      SMS &amp; Messenger
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Basic reports
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-auto">
                {currentPlanCode === 'BASIC' ? (
                  <div className="w-full py-[9.375px] bg-[#F0FAF9] border-[1.33px] border-[#0E3F39]/20 rounded-[8px] flex items-center justify-center font-['Work_Sans'] font-semibold text-[11.25px] text-[#0E3F39]">
                    ✓ Your Current Plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingPlan({ plan_code: 'BASIC', plan_name: 'Basic', action: 'downgrade' })}
                    className="w-full h-[34px] bg-[#6B7280] hover:bg-[#5a606d] text-white font-['Work_Sans'] font-semibold text-[11.25px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Downgrade to Basic</span>
                    <img src={assets.iconSubArrowRightSmall} alt="" className="w-3 h-3 object-contain" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Pro Plan Card (Most Popular) */}
            <div className="bg-white border-[1.33px] border-black/10 rounded-[12px] p-[18.75px] flex flex-col justify-between relative shadow-[0px_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-colors">
              {/* MOST POPULAR Pill */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#0E3F39] text-white font-['Work_Sans'] font-bold text-[10px] leading-[15px] px-[9.375px] py-[1.875px] rounded-full shadow-xs">
                MOST POPULAR
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-[#FEF3C7] text-[#92400E] font-['Work_Sans'] font-semibold text-[11.25px] px-[7.5px] py-[2px] rounded-full">
                    Pro
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-['Work_Sans'] text-[#1E2939]">
                    <span className="font-bold text-[22.5px] leading-[30px]">₱2,490</span>
                    <span className="font-normal text-[11.25px] leading-[15px] text-[#8A9DA0]">/month</span>
                  </p>
                  <p className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76] mt-1">
                    For growing clinics with multiple dentists
                  </p>
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Up to 5 dentists
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      10 staff seats
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Unlimited patients
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      SMS, Messenger, Email
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Advanced reports
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-auto">
                {currentPlanCode === 'PRO' ? (
                  <div className="w-full py-[9.375px] bg-[#F0FAF9] border-[1.33px] border-[#0E3F39]/20 rounded-[8px] flex items-center justify-center font-['Work_Sans'] font-semibold text-[11.25px] text-[#0E3F39]">
                    ✓ Your Current Plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingPlan({ 
                      plan_code: 'PRO', 
                      plan_name: 'Pro', 
                      action: currentPlanCode === 'ENTERPRISE' ? 'downgrade' : 'upgrade' 
                    })}
                    className="w-full h-[34px] bg-[#6B7280] hover:bg-[#5a606d] text-white font-['Work_Sans'] font-semibold text-[11.25px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{currentPlanCode === 'ENTERPRISE' ? 'Downgrade to Pro' : 'Upgrade to Pro'}</span>
                    <img src={assets.iconSubArrowRightSmall} alt="" className="w-3 h-3 object-contain" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Enterprise Plan Card */}
            <div className="bg-white border-[#0E3F39] border-[1.33px] rounded-[12px] p-[18.75px] flex flex-col justify-between shadow-[0px_2px_8px_rgba(14,63,57,0.08)]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-[#D4ECE9] text-[#0E3F39] font-['Work_Sans'] font-semibold text-[11.25px] px-[7.5px] py-[2px] rounded-full">
                    Enterprise
                  </span>
                  <span className="bg-[#0E3F39] text-white font-['Work_Sans'] font-bold text-[10px] px-[7.5px] py-[2px] rounded-full">
                    Current
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-['Work_Sans'] text-[#1E2939]">
                    <span className="font-bold text-[22.5px] leading-[30px]">₱7,500</span>
                    <span className="font-normal text-[11.25px] leading-[15px] text-[#8A9DA0]">/month</span>
                  </p>
                  <p className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76] mt-1">
                    For multi-branch clinics and networks
                  </p>
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Unlimited dentists
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Unlimited seats
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Unlimited patients
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      All channels + custom integrations
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <img src={assets.iconSubCheckSmall} alt="" className="w-2.5 h-2.5 object-contain shrink-0" />
                    <span className="font-['Work_Sans'] font-normal text-[11px] leading-[16.5px] text-[#5A7A76]">
                      Custom reports &amp; white-label
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-auto">
                {currentPlanCode === 'ENTERPRISE' ? (
                  <div className="w-full py-[9.375px] bg-[#F0FAF9] border-[1.33px] border-[#0E3F39]/20 rounded-[8px] flex items-center justify-center font-['Work_Sans'] font-semibold text-[11.25px] text-[#0E3F39]">
                    ✓ Your Current Plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingPlan({ plan_code: 'ENTERPRISE', plan_name: 'Enterprise', action: 'upgrade' })}
                    className="w-full h-[34px] bg-linear-to-r from-primary to-black hover:opacity-90 text-white font-['Work_Sans'] font-semibold text-[11.25px] rounded-[8px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Upgrade to Enterprise</span>
                    <img src={assets.iconSubArrowRightSmall} alt="" className="w-3 h-3 object-contain" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ── FULL FEATURE COMPARISON TABLE (node 787:20091) ── */}
          <div className="w-full bg-white border-[1.33px] border-[#0E3F39]/10 rounded-[10px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.04)] mt-2">
            {/* Header row */}
            <div className="border-b-[1.33px] border-[#0E3F39]/6 px-[18.75px] py-[13.125px]">
              <h4 className="font-['Work_Sans'] font-bold text-[13.125px] leading-[18.75px] text-[#1E2939]">
                Full Feature Comparison
              </h4>
            </div>

            {/* Responsive Table Container */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#F8FAFA] text-[#5A7A76] font-['Work_Sans'] text-[11.25px]">
                    <th className="py-4 px-[18.75px] font-semibold text-[#5A7A76] w-[26%]">
                      Feature
                    </th>
                    <th className="py-4 px-3 text-center font-bold w-[24%]">
                      <div className="text-[13.125px] text-[#1E2939]">Basic</div>
                      <div className="text-[11.25px] text-[#8A9DA0] font-normal">₱990/month</div>
                    </th>
                    <th className="py-4 px-3 text-center font-bold w-[24%]">
                      <div className="text-[13.125px] text-[#1E2939]">Pro</div>
                      <div className="text-[11.25px] text-[#8A9DA0] font-normal">₱2,490/month</div>
                    </th>
                    <th className="py-3 px-3 text-center font-bold w-[26%] bg-[#F8FDFC]">
                      <div className="text-[13.125px] text-[#0E3F39]">Enterprise</div>
                      <div className="text-[11.25px] text-[#8A9DA0] font-normal">₱7,500/month</div>
                      <div className="text-[10px] text-[#0E3F39] font-bold mt-0.5">▲ Current</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E3F39]/6 font-['Work_Sans'] text-[11.25px]">
                  {/* Row 1: Dentists */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Dentists</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">1 dentist</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Up to 5 dentists</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Unlimited dentists</td>
                  </tr>

                  {/* Row 2: Staff Seats */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Staff Seats</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">2 staff seats</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">10 staff seats</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Unlimited seats</td>
                  </tr>

                  {/* Row 3: Patient Capacity */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Patient Capacity</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">100 patients/month</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Unlimited patients</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Unlimited patients</td>
                  </tr>

                  {/* Row 4: Communication Channels */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Communication Channels</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">SMS &amp; Messenger</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">SMS, Messenger, Email</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">All channels + custom integrations</td>
                  </tr>

                  {/* Row 5: Reporting */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Reporting</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Basic reports</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Advanced reports</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Custom reports &amp; white-label</td>
                  </tr>

                  {/* Row 6: PDF Export */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">PDF Export</td>
                    <td className="py-2.5 px-3 text-center">
                      <img src={assets.iconSubCrossGray} alt="No" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <img src={assets.iconSubCheckGreen} alt="Yes" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                    <td className="py-2.5 px-3 text-center bg-[#F8FDFC]">
                      <img src={assets.iconSubCheckGreen} alt="Yes" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                  </tr>

                  {/* Row 7: White-Label Branding */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">White-Label Branding</td>
                    <td className="py-2.5 px-3 text-center">
                      <img src={assets.iconSubCrossGray} alt="No" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <img src={assets.iconSubCrossGray} alt="No" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                    <td className="py-2.5 px-3 text-center bg-[#F8FDFC]">
                      <img src={assets.iconSubCheckGreen} alt="Yes" className="w-3.5 h-3.5 mx-auto object-contain" />
                    </td>
                  </tr>

                  {/* Row 8: Data Retention */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Data Retention</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">1 year data retention</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">3 years data retention</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Unlimited data retention</td>
                  </tr>

                  {/* Row 9: Support */}
                  <tr>
                    <td className="py-2.5 px-[18.75px] font-medium text-[#5A7A76]">Support</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Email support</td>
                    <td className="py-2.5 px-3 text-center text-[#5A7A76]">Priority email &amp; chat</td>
                    <td className="py-2.5 px-3 text-center text-[#1E2939] font-medium bg-[#F8FDFC]">Dedicated account manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── FOOTER SUPPORT LINK ── */}
          <div className="w-full text-center py-4">
            <p className="font-['Work_Sans'] font-normal text-[11.25px] leading-[15px] text-[#A0B0B3]">
              Need to cancel your subscription or have billing questions?{' '}
              <a
                href="mailto:support@pivodent.ph"
                className="text-[#0E3F39] font-medium underline hover:text-[#0b332e] transition-colors"
              >
                Contact support@pivodent.ph
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal for Plan Change ── */}
      {pendingPlan && (
        <ConfirmModal
          isOpen={!!pendingPlan}
          title={`Confirm ${pendingPlan.action === 'upgrade' ? 'Upgrade' : 'Downgrade'} to ${pendingPlan.plan_name}?`}
          confirmText={actionLoading ? 'Updating...' : `Yes, ${pendingPlan.action === 'upgrade' ? 'Upgrade' : 'Downgrade'}`}
          cancelText="Cancel"
          type="info"
          onConfirm={handlePlanChangeConfirm}
          onCancel={() => setPendingPlan(null)}
        />
      )}
    </div>
  );
}
