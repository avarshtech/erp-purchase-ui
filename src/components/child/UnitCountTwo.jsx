import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'
import useReactApexChart from '../../hook/useReactApexChart'

const UnitCountTwo = () => {

    let { createChart } = useReactApexChart()



    return (
        <div className="col-xxl-8">
            <div className="row gy-4">
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-1">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0">
                                        <Icon
                                            icon="mingcute:user-follow-fill"
                                            className="icon"
                                        />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            New Users
                                        </span>
                                        <h6 className="fw-semibold">15,000</h6>
                                    </div>
                                </div>
                                <div
                                    id="new-user-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#487fff')}

                                </div>

                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                    +200
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-2">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-success-main flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6">
                                        <Icon
                                            icon="mingcute:user-follow-fill"
                                            className="icon"
                                        />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            Active Users
                                        </span>
                                        <h6 className="fw-semibold">8,000</h6>
                                    </div>
                                </div>
                                <div
                                    id="active-user-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#45b369')}
                                </div>
                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                    +200
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-3">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-yellow text-white flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                        <Icon
                                            icon="iconamoon:discount-fill"
                                            className="icon"
                                        />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            Total Sales
                                        </span>
                                        <h6 className="fw-semibold">$5,00,000</h6>
                                    </div>
                                </div>
                                <div
                                    id="total-sales-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#f4941e')}
                                </div>
                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-danger-focus px-1 rounded-2 fw-medium text-danger-main text-sm">
                                    -$10k
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-4">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-purple text-white flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                        <Icon icon="mdi:message-text" className="icon" />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            Conversion
                                        </span>
                                        <h6 className="fw-semibold">25%</h6>
                                    </div>
                                </div>
                                <div
                                    id="conversion-user-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#8252e9')}
                                </div>
                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                    +5%
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-5">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-pink text-white flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                        <Icon icon="mdi:leads" className="icon" />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            Leads
                                        </span>
                                        <h6 className="fw-semibold">250</h6>
                                    </div>
                                </div>
                                <div
                                    id="leads-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#de3ace')}
                                </div>
                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                    +20
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-4 col-sm-6">
                    <div className="card p-3 shadow-2 radius-8 border input-form-light h-100 bg-gradient-end-6">
                        <div className="card-body p-0">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="mb-0 w-48-px h-48-px bg-cyan text-white flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                        <Icon
                                            icon="streamline:bag-dollar-solid"
                                            className="icon"
                                        />
                                    </span>
                                    <div>
                                        <span className="mb-2 fw-medium text-secondary-light text-sm">
                                            Total Profit
                                        </span>
                                        <h6 className="fw-semibold">$3,00,700</h6>
                                    </div>
                                </div>
                                <div
                                    id="total-profit-chart"
                                    className="remove-tooltip-title rounded-tooltip-value"
                                >
                                    {/* Pass the color value here */}
                                    {createChart('#00b8f2')}
                                </div>
                            </div>
                            <p className="text-sm mb-0">
                                Increase by{" "}
                                <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                    +$15k
                                </span>{" "}
                                this week
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UnitCountTwo