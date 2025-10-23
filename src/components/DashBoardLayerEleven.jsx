import React from "react";
import UnitCountEight from "./child/UnitCountEight";
import BalanceStatistic from "./child/BalanceStatistic";
import EarningCategories from "./child/EarningCategories";
import ExpenseStatistics from "./child/ExpenseStatistics";
import PaymentHistory from "./child/PaymentHistory";
import MonthlyExpenseBreakdown from "./child/MonthlyExpenseBreakdown";
import QuickTransfer from "./child/QuickTransfer";
import Investment from "./child/Investment";
import PaymentHistoryOne from "./child/PaymentHistoryOne";

const DashBoardLayerEleven = () => {
  return (
    <>
      {/* UnitCountEight */}
      <UnitCountEight />

      <div className='mt-24'>
        <div className='row gy-4'>
          <div className='col-xl-8'>
            <div className='row gy-4'>
              {/* BalanceStatistic */}
              <BalanceStatistic />

              {/* EarningCategories */}
              <EarningCategories />

              {/* ExpenseStatistics */}
              <ExpenseStatistics />

              {/* PaymentHistory */}
              <PaymentHistory />

              {/* MonthlyExpenseBreakdown */}
              <MonthlyExpenseBreakdown />
            </div>
          </div>
          {/* Sidebar start */}
          <div className='col-xl-4'>
            {/* QuickTransfer */}
            <QuickTransfer />

            {/* Investment */}
            <Investment />
          </div>
          {/* Sidebar end */}
        </div>
      </div>

      {/* PaymentHistoryOne */}
      <PaymentHistoryOne />
    </>
  );
};

export default DashBoardLayerEleven;
