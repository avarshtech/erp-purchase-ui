import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'

const UnitCountFour = () => {
    return (
        <>
            {/* Dashboard Widget Start */}
            <div className="col-xxl-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start-3">
                    <div className="card-body p-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div className="d-flex align-items-center">
                                <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                                    <span className="mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                                        <Icon
                                            icon="flowbite:users-group-solid"
                                            className="icon"
                                        />
                                    </span>
                                </div>
                                <div>
                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                        New Users
                                    </span>
                                    <h6 className="fw-semibold my-1">5000</h6>
                                    <p className="text-sm mb-0">
                                        Increase by {" "}
                                        <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                            +200
                                        </span>{" "}
                                        this week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dashboard Widget End */}
            {/* Dashboard Widget Start */}
            <div className="col-xxl-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start-2">
                    <div className="card-body p-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div className="d-flex align-items-center">
                                <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                                    <span className="mb-0 w-40-px h-40-px bg-purple flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                                        <Icon
                                            icon="solar:wallet-bold"
                                            className="text-white text-2xl mb-0"
                                        />
                                    </span>
                                </div>
                                <div>
                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                        Total Deposit
                                    </span>
                                    <h6 className="fw-semibold my-1">15,000</h6>
                                    <p className="text-sm mb-0">
                                        Increase by {" "}
                                        <span className="bg-danger-focus px-1 rounded-2 fw-medium text-danger-main text-sm">
                                            -200
                                        </span>{" "}
                                        this week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dashboard Widget End */}
            {/* Dashboard Widget Start */}
            <div className="col-xxl-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start-5">
                    <div className="card-body p-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div className="d-flex align-items-center">
                                <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                                    <span className="mb-0 w-40-px h-40-px bg-red flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                                        <Icon
                                            icon="fa6-solid:file-invoice-dollar"
                                            className="text-white text-2xl mb-0"
                                        />
                                    </span>
                                </div>
                                <div>
                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                        Total Expense
                                    </span>
                                    <h6 className="fw-semibold my-1">15,000</h6>
                                    <p className="text-sm mb-0">
                                        Increase by {" "}
                                        <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                            +200
                                        </span>
                                        this week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dashboard Widget End */}
            {/* Dashboard Widget Start */}
            <div className="col-xxl-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start-4">
                    <div className="card-body p-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div className="d-flex align-items-center">
                                <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                                    <span className="mb-0 w-40-px h-40-px bg-success-main flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                                        <Icon
                                            icon="streamline:bag-dollar-solid"
                                            className="icon"
                                        />
                                    </span>
                                </div>
                                <div>
                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                        Total Earning
                                    </span>
                                    <h6 className="fw-semibold my-1">15,000</h6>
                                    <p className="text-sm mb-0">
                                        Increase by {" "}
                                        <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">
                                            +200
                                        </span>{" "}
                                        this week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dashboard Widget End */}</>
    )
}

export default UnitCountFour