import { Auth } from './auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

/**
 * Marks a route as not requiring authentication at all — the opt-out for
 * the global fail-closed AuthenticationGuard. Thin alias over the existing
 * @Auth(AuthType.None) marker so there's one public-route mechanism, not two.
 */
export const Public = () => Auth(AuthType.None);
