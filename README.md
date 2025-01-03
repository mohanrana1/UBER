## Endpoints

### User Registration

#### POST `/api/v1/users/register`

This endpoint is used to register a new user.

##### Request Body

The request body should be a JSON object containing the following fields:

- `fullname` (object, required)
  - `firstname` (string, required): The first name of the user. Must be at least 3 characters long.
  - `lastname` (string, optional): The last name of the user. Must be at least 3 characters long.
- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user. Must be at least 6 characters long.
- `username` (string, required): The username for the user. Must be unique.

##### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

##### Example Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "60c72b2f9b1e8b001c8e4e5b",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "username": "johndoe",
    "createdAt": "2023-10-01T12:34:56.789Z",
    "updatedAt": "2023-10-01T12:34:56.789Z"
  },
  "message": "User registered successfully",
  "success": true
}
```



### User Login

#### POST `/api/v1/users/login`

This endpoint is used to login a  user.

##### Request Body

The request body should be a JSON object containing the following fields:

- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user. Must be at least 6 characters long.

##### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

##### Example Response

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "60c72b2f9b1e8b001c8e4e5b",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "username": "johndoe",
      "createdAt": "2023-10-01T12:34:56.789Z",
      "updatedAt": "2023-10-01T12:34:56.789Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully",
  "success": true
}
```





### User profile

#### POST `/api/v1/users/profile`

This endpoint is used to get the profile of the currently logged-in user.



##### Example Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "60c72b2f9b1e8b001c8e4e5b",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "username": "johndoe",
    "createdAt": "2023-10-01T12:34:56.789Z",
    "updatedAt": "2023-10-01T12:34:56.789Z"
  },
  "message": "Current user fetched successfully",
  "success": true
}
```







### User Logout

#### POST `/api/v1/users/logout`

This endpoint is used to logout a new user.

### authorization
Requires a valid jwt token in authorization header or cookies.

##### Example Response

```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully",
  "success": true
}
```

