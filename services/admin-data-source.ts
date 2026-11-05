import type {
    AdminAnalytics,
    AdminFilterOptions,
    AdminGlobalMetrics,
    AdminReport,
    AdminReportFilters,
    AdminSummaryFilters,
    ApiError,
    ApiErrorCode,
    ApiResult,
    DeleteAdminReportResponse,
    HealthStatus,
    PaginatedResponse,
} from "@/types/admin";

/**
 * Contract shared by the two admin data sources (admin-mock-source.ts and admin-http-source.ts).
 * services/admin.service.ts picks one of them; components and Server Actions never know which.
 */
export interface AdminDataSource {
    getHealthStatus(): Promise<ApiResult<HealthStatus>>;
    getFilterOptions(): Promise<ApiResult<AdminFilterOptions>>;
    getGlobalMetrics(): Promise<ApiResult<AdminGlobalMetrics>>;
    getAnalytics(filters: AdminSummaryFilters): Promise<ApiResult<AdminAnalytics>>;
    getReports(filters: AdminReportFilters): Promise<ApiResult<PaginatedResponse<AdminReport>>>;
    deleteReport(id: string): Promise<ApiResult<DeleteAdminReportResponse>>;
}

/** Spanish messages per code. Backend messages are never shown as they are. */
export const ADMIN_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
    BAD_REQUEST: "La solicitud no es válida.",
    UNAUTHORIZED: "Tu sesión expiró. Inicia sesión de nuevo.",
    FORBIDDEN: "No tienes permisos para realizar esta acción.",
    NOT_FOUND: "El reporte no existe o ya fue eliminado.",
    CONFLICT: "El reporte no se puede modificar en su estado actual.",
    SERVER_ERROR: "Ocurrió un error en el servidor.",
    SERVICE_UNAVAILABLE: "El servicio no está disponible en este momento.",
    NETWORK_ERROR: "No fue posible conectar con el servidor.",
    INVALID_RESPONSE: "El servidor envió una respuesta inesperada.",
};

export function createApiError(code: ApiErrorCode, status?: number): ApiError {
    return status === undefined
        ? { code, message: ADMIN_ERROR_MESSAGES[code] }
        : { code, message: ADMIN_ERROR_MESSAGES[code], status };
}
