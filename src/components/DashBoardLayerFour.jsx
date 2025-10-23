import React from 'react'
import UnitCountThree from './child/UnitCountThree'
import CoinAnalyticsOne from './child/CoinAnalyticsOne'
import CoinAnalyticsTwo from './child/CoinAnalyticsTwo'
import MyOrdersOne from './child/MyOrdersOne'
import RecentTransactionOne from './child/RecentTransactionOne'
import MyCardsOne from './child/MyCardsOne'
import TotalBalanceOne from './child/TotalBalanceOne'
import UserActivatesOne from './child/UserActivatesOne'

const DashBoardLayerFour = () => {
  return (
    <>
      {/* UnitCountThree */}
      <UnitCountThree />

      <section>
        <div className="row gy-4 mt-4">
          {/* Crypto Home Widgets Start */}
          <div className="col-xxl-8">
            <div className="row gy-4">

              {/* CoinAnalyticsOne */}
              <CoinAnalyticsOne />


              {/* CoinAnalyticsTwo */}
              <CoinAnalyticsTwo />


              {/* MyOrdersOne */}
              <MyOrdersOne />

              {/* RecentTransactionOne */}
              <RecentTransactionOne />

            </div>
          </div>

          {/* Crypto Home Widgets End */}

          <div className="col-xxl-4">
            <div className="row gy-4">

              {/* MyCardsOne */}
              <MyCardsOne />

              {/* TotalBalanceOne */}
              <TotalBalanceOne />

              {/* UserActivatesOne */}
              <UserActivatesOne />

            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default DashBoardLayerFour