import * as authApi from './auth';
import * as userApi from './user';
import * as taskApi from './task';
import * as adminApi from './admin';

export { authApi, userApi, taskApi, adminApi };

// 也可以通过默认导出所有API
export default {
  auth: authApi,
  user: userApi,
  task: taskApi,
  admin: adminApi,
}; 