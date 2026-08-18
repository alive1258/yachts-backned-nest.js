import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

/**
 * Admin/mine payment list query. Status/type/booking_id filters go through
 * the generic `filters` object on PaginationQueryDto, same as bookings.
 */
export class GetPaymentDto extends PaginationQueryDto {}
