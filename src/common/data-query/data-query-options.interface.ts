import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { PaginationQueryDto } from './dto/data-query.dto';


export interface DataQueryOptions<T extends ObjectLiteral> {
  repository: Repository<T>;
  alias?: string;
  pagination: PaginationQueryDto;
  searchableFields?: string[];
  filterableFields?: Array<keyof T>;
  relations?: string[];
  select?: Array<keyof T>;
  selectRelations?: string[];
  sumFields?: Array<keyof T>;
  where?: FindOptionsWhere<T>;
  filters?: FindOptionsWhere<T>;
  parameters?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  additionalWhere?: string;
}
