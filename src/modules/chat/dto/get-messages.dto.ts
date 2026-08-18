import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

/**
 * Message history is always scoped to one conversation (resolved server-side
 * from the URL param or the caller's own thread) — nothing to filter or
 * search on here beyond the standard page/limit.
 */
export class GetMessagesDto extends PaginationQueryDto {}
