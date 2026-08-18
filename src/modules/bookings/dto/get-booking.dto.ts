import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

/**
 * Admin/mine booking list query. Status/payment_status/yacht_id filters go
 * through the generic `filters` object on PaginationQueryDto (read by
 * DataQueryService/QueryBuilderHelper), same as every other admin list
 * endpoint in this codebase.
 */
export class GetBookingDto extends PaginationQueryDto {}
