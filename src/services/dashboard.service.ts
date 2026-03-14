import { axiosInstance } from '@/lib/axios'
import { API } from '@/constants/api'
import type { DeptKpiModel, UserAttendanceToday, HourlyData } from '@/types'

export const dashboardService = {
  getKpi: () =>
    axiosInstance.get<DeptKpiModel>(API.DASHBOARD_KPI).then(r => r.data),

  getTodayAttendance: () =>
    axiosInstance.get<UserAttendanceToday[]>(API.DASHBOARD_TODAY).then(r => r.data),

  getHourlyActivity: () =>
    axiosInstance.get<HourlyData[]>(API.DASHBOARD_HOURLY).then(r => r.data),
}
