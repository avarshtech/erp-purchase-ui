import React from 'react'
import UnitCountFive from './child/UnitCountFive'
import TrafficSourcesOne from './child/TrafficSourcesOne'
import TopCategoriesOne from './child/TopCategoriesOne'
import TopInstructorsOne from './child/TopInstructorsOne'
import StudentProgressOne from './child/StudentProgressOne'
import CoursesOne from './child/CoursesOne'
import CourseActivityOne from './child/CourseActivityOne'

const DashBoardLayerSix = () => {
    return (
        <>
            <div className="row gy-4 mb-24">

                {/* UnitCountFive */}
                <UnitCountFive />

                {/* TrafficSourcesOne */}
                <TrafficSourcesOne />

                {/* TopCategoriesOne */}
                <TopCategoriesOne />

                {/* TopInstructorsOne */}
                <TopInstructorsOne />

                {/* StudentProgressOne */}
                <StudentProgressOne />

                {/* CoursesOne */}
                <CoursesOne />

                {/* CourseActivityOne */}
                <CourseActivityOne />

            </div>
        </>
    )
}

export default DashBoardLayerSix