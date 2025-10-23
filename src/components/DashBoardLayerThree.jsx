import React from 'react'
import RevenueReportOne from './child/RevenueReportOne'
import CustomersStatisticsOne from './child/CustomersStatisticsOne'
import RecentOrdersOne from './child/RecentOrdersOne'
import TransactionsOne from './child/TransactionsOne'
import RecentOrdersTwo from './child/RecentOrdersTwo'
import DistributionMapsOne from './child/DistributionMapsOne'
import TopCustomersOne from './child/TopCustomersOne'
import TopSellingProductOne from './child/TopSellingProductOne'
import StockReportOne from './child/StockReportOne'

const DashBoardLayerThree = () => {

  return (
    <section className="row gy-4">
      {/* RevenueReportOne */}
      <RevenueReportOne />

      {/* CustomersStatisticsOne */}
      <CustomersStatisticsOne />

      {/* RecentOrdersOne */}
      <RecentOrdersOne />

      {/* TransactionsOne */}
      <TransactionsOne />

      {/* RecentOrdersTwo */}
      <RecentOrdersTwo />

      {/* DistributionMapsOne */}
      <DistributionMapsOne />

      {/* TopCustomersOne */}
      <TopCustomersOne />


      {/* TopSellingProductOne */}
      <TopSellingProductOne />


      {/* StockReportOne */}
      <StockReportOne />

    </section>


  )
}

export default DashBoardLayerThree