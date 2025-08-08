declare module "express-mysql-session" {
  import { Store } from "express-session";
  import { Pool, PoolConfig, PoolConnection } from "mysql2/promise";

  function MySQLStoreFactory(session: any): {
    new (options?: {}, connection?: Pool | PoolConfig | PoolConnection): Store;
  };

  export = MySQLStoreFactory;
}
