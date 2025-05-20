const BASE_URL_BE = "http://localhost:8000/api"
const BASE_URL_MODEL = "http://localhost:5000"
export const API_ENDPOINTS = {
    COURSE: {
        GET_ALL : `${BASE_URL_BE}/courses`,
        GET_BY_ID: (course_id: string) => `${BASE_URL_BE}/courses/${course_id}`
    },
    MODEL : {
        PREDICT_AGE: `${BASE_URL_MODEL}/predict_age`,
    }
}