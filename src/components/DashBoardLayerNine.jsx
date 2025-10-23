import React from "react";
import UpgradeYourPlan from "./child/UpgradeYourPlan";
import RevenueStatisticOne from "./child/RevenueStatisticOne";
import SupportTracker from "./child/SupportTracker";
import AverageDailySales from "./child/AverageDailySales";
import TransactionsTwo from "./child/TransactionsTwo";
import SalesByCountries from "./child/SalesByCountries";
import SourceVisitors from "./child/SourceVisitors";
import MonthlyCampaignState from "./child/MonthlyCampaignState";
import RecentActivityOne from "./child/RecentActivityOne";

const DashBoardLayerNine = () => {
  return (
    <div className='row gy-4'>
      {/* UpgradeYourPlan */}
      <UpgradeYourPlan />

      {/* RevenueStatisticOne */}
      <RevenueStatisticOne />

      {/* SupportTracker */}
      <SupportTracker />

      {/* AverageDailySales */}
      <AverageDailySales />

      {/* TransactionsTwo */}
      <TransactionsTwo />

      {/* SalesByCountries */}
      <SalesByCountries />

      {/* SourceVisitors */}
      <SourceVisitors />

      {/* MonthlyCampaignState */}
      <MonthlyCampaignState />

      {/* RecentActivityOne */}
      <RecentActivityOne />
    </div>
  );
};

export default DashBoardLayerNine;
