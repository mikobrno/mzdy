# API Documentation for SVJ Management Portal

## Overview
The SVJ Management Portal provides a comprehensive API for managing payroll and communication tasks for multiple entities, specifically for Společenství vlastníků jednotek (SVJ). This documentation outlines the available endpoints, request/response formats, and usage examples.

## Base URL
The base URL for all API requests is:
```
https://api.svj-management-portal.com/v1
```

## Authentication
All API requests require authentication via a Bearer token. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. SVJ Management

#### Get All SVJs
- **Endpoint:** `/svjs`
- **Method:** `GET`
- **Description:** Retrieves a list of all SVJs.
- **Response:**
  - **200 OK**
    ```json
    [
      {
        "id": "1",
        "nazev": "SVJ Example",
        "ico": "12345678",
        "adresa": "Example Street 1",
        "iban": "CZ1234567890123456789012",
        "datovaSchranka": "example_ds",
        "kontaktníOsoba": "John Doe",
        "email": "john.doe@example.com",
        "rychlyPopis": "Quick description",
        "zpusobOdesilani": "Odesílá správce"
      }
    ]
    ```

#### Create SVJ
- **Endpoint:** `/svjs`
- **Method:** `POST`
- **Description:** Creates a new SVJ.
- **Request Body:**
  ```json
  {
    "nazev": "New SVJ",
    "ico": "87654321",
    "adresa": "New Street 2",
    "iban": "CZ0987654321098765432109",
    "datovaSchranka": "new_svj_ds",
    "kontaktníOsoba": "Jane Doe",
    "email": "jane.doe@example.com",
    "rychlyPopis": "New quick description",
    "zpusobOdesilani": "Odesílá klient"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "id": "2",
      "message": "SVJ created successfully."
    }
    ```

### 2. Employee Management

#### Get All Employees
- **Endpoint:** `/employees`
- **Method:** `GET`
- **Description:** Retrieves a list of all employees associated with a specific SVJ.
- **Response:**
  - **200 OK**
    ```json
    [
      {
        "id": "1",
        "jmeno": "John Smith",
        "adresa": "Employee Street 1",
        "rodneCislo": "123456/7890",
        "kontakt": "john.smith@example.com",
        "typUvazku": "DPP",
        "vyseOdměny": "2000",
        "cisloUctu": "CZ1234567890123456789012"
      }
    ]
    ```

#### Create Employee
- **Endpoint:** `/employees`
- **Method:** `POST`
- **Description:** Adds a new employee to a specific SVJ.
- **Request Body:**
  ```json
  {
    "jmeno": "New Employee",
    "adresa": "New Employee Street 2",
    "rodneCislo": "098765/4321",
    "kontakt": "new.employee@example.com",
    "typUvazku": "Člen výboru",
    "vyseOdměny": "3000",
    "cisloUctu": "CZ0987654321098765432109"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "id": "2",
      "message": "Employee created successfully."
    }
    ```

### 3. Payroll Management

#### Generate Payroll
- **Endpoint:** `/payroll/generate`
- **Method:** `POST`
- **Description:** Generates payroll for the specified month and year.
- **Request Body:**
  ```json
  {
    "mesic": "10",
    "rok": "2023"
  }
  ```
- **Response:**
  - **200 OK**
    ```json
    {
      "message": "Payroll generated successfully."
    }
    ```

## Error Handling
All error responses will include a status code and a message detailing the error. For example:
- **400 Bad Request**
  ```json
  {
    "error": "Invalid input data."
  }
  ```

## Conclusion
This API documentation provides a high-level overview of the endpoints available in the SVJ Management Portal. For further details, please refer to the specific endpoint documentation or contact the development team.