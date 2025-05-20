const BASE_URL_BE = "http://localhost:8000/api"
const BASE_URL_MODEL = "http://localhost:5000"
export const API_ENDPOINTS = {
    COURSE: {
        GET_ALL : `${BASE_URL_BE}/courses`,
        GET_BY_ID: (course_id: string) => `${BASE_URL_BE}/courses/${course_id}`,
        GET_STUDENTS_BY_COURSE_ID: (course_id: string) => `${BASE_URL_BE}/courses/${course_id}/students`,
        GET_ATTENDANCES_BY_COURSE_ID: (course_id: string) => `${BASE_URL_BE}/courses/${course_id}/attendances`
    },
    MODEL : {
        PREDICT_AGE: `${BASE_URL_MODEL}/predict_age`,
    },
    ATTENDANCE :{
        CREATE_ATTENDANCE: `${BASE_URL_BE}/attendance`,
        END_ATTENDANCE: (attendance_id: number) =>  `${BASE_URL_BE}/${attendance_id}/end`
    }
}