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
