import React from 'react';
import useReactApexChart from '../../hook/useReactApexChart';

const UnitCountFive = () => {

    let { createChartSix } = useReactApexChart();
    return (
        <div className="col-xxl-8">
            <div className="card radius-8 border-0 p-20">
                <div className="row gy-4">
                    <div className="col-xxl-4">
                        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-1 mb-12">
                            <div className="card-body p-0">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-0">
                                    <div className="d-flex align-items-center gap-2 mb-12">
                                        <span className="mb-0 w-48-px h-48-px bg-base text-pink text-2xl flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                            <i className="ri-group-fill" />
                                        </span>
                                        <div>
                                            <span className="mb-0 fw-medium text-secondary-light text-lg">
                                                Total Students
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-8">
                                    <h5 className="fw-semibold mb-0">15,000</h5>
                                    <p className="text-sm mb-0 d-flex align-items-center gap-8">
                                        <span className="text-white px-1 rounded-2 fw-medium bg-success-main text-sm">
                                            +2.5k
                                        </span>
                                        This Month
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-2 mb-12">
                            <div className="card-body p-0">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-0">
                                    <div className="d-flex align-items-center gap-2 mb-12">
                                        <span className="mb-0 w-48-px h-48-px bg-base text-purple text-2xl flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                            <i className="ri-youtube-fill" />
                                        </span>
                                        <div>
                                            <span className="mb-0 fw-medium text-secondary-light text-lg">
                                                Total Courses
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-8">
                                    <h5 className="fw-semibold mb-0">420</h5>
                                    <p className="text-sm mb-0 d-flex align-items-center gap-8">
                                        <span className="text-white px-1 rounded-2 fw-medium bg-success-main text-sm">
                                            +30
                                        </span>
                                        This Month
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-3 mb-0">
                            <div className="card-body p-0">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-0">
                                    <div className="d-flex align-items-center gap-2 mb-12">
                                        <span className="mb-0 w-48-px h-48-px bg-base text-info text-2xl flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle h6">
                                            <i className="ri-money-dollar-circle-fill" />
                                        </span>
                                        <div>
                                            <span className="mb-0 fw-medium text-secondary-light text-lg">
                                                Overall Revenue
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-8">
                                    <h5 className="fw-semibold mb-0">$50,000</h5>
                                    <p className="text-sm mb-0 d-flex align-items-center gap-8">
                                        <span className="text-white px-1 rounded-2 fw-medium bg-success-main text-sm">
                                            +1.5k
                                        </span>
                                        This Month
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-8">
                        <div className="card-body p-0">
                            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                                <h6 className="mb-2 fw-bold text-lg">Average Enrollment Rate</h6>
                                <div className="">
                                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light" defaultValue="Yearly">
                                        <option value="Yearly">Yearly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Today">Today</option>
                                    </select>
                                </div>
                            </div>
                            <ul className="d-flex flex-wrap align-items-center justify-content-center mt-3 gap-3">
                                <li className="d-flex align-items-center gap-2">
                                    <span className="w-12-px h-12-px rounded-circle bg-primary-600" />
                                    <span className="text-secondary-light text-sm fw-semibold">
                                        Paid Course:
                                        <span className="text-primary-light fw-bold">350</span>
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <span className="w-12-px h-12-px rounded-circle bg-success-main" />
                                    <span className="text-secondary-light text-sm fw-semibold">
                                        Free Course:
                                        <span className="text-primary-light fw-bold">70</span>
                                    </span>
                                </li>
                            </ul>
                            <div className="mt-40">
                                <div
                                    id="enrollmentChart"
                                    className="apexcharts-tooltip-style-1"
                                >
                                    {/* Pass the color value */}
                                    {createChartSix('#45B369', '#487fff')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitCountFive;