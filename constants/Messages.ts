export namespace Messages {
    export class Tasks
    {
        public static readonly CREATED = 'Task created';
        public static readonly CHANGED = 'Task changed';
        public static readonly REMOVED = 'Task removed';
        public static readonly NOT_PROVIDED = 'Task not provided';
        public static readonly NOT_FOUND = 'Task not found';
        public static readonly EARLY_DATE = 'Date cannot be earlier than today';
    }

    export class User
    {
        public static readonly MISSING_INFO = 'Please provide username and password';
        public static readonly NOT_FOUND = 'User or password not found';
        public static readonly INVALID_NAME = 'Invalid name';
        public static readonly INVALID_EMAIL = 'Invalid email';
        public static readonly INVALID_PASSWORD = 'Invalid password';
        public static readonly EXISTS = 'A user with this email already exists';
        public static readonly CREATED = 'User created';
    }

    export class Technical
    {
        public static readonly MISSING_DB_INFO = 'Missing ENV Database connection info';
        public static readonly INVALID_METHOD = 'Invalid method';
        public static readonly MISSING_JWT_KEY = 'JWT ENV Key not provided';
    }
}