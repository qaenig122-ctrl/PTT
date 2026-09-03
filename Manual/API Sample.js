
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/office-api/auth/signin": {
        "post": {
          "operationId": "AuthController_signIn",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SignInDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "summary": "Sign in user and set JWT tokens as HttpOnly cookies",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "summary": "Refresh access token using HttpOnly refresh cookie",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Logout user and clear auth cookies",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/auth/forgot-password": {
        "post": {
          "operationId": "AuthController_forgotPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForgotPasswordDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Reset link sent if email exists."
            }
          },
          "summary": "Request a password reset link",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/auth/reset-password": {
        "post": {
          "operationId": "AuthController_resetPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ResetPasswordDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password successfully reset."
            }
          },
          "summary": "Reset password using a token",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/auth/change-password": {
        "post": {
          "operationId": "AuthController_changePassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ChangePasswordDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password changed successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Change current user password",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/office-api/public-registration/register": {
        "post": {
          "operationId": "PublicRegistrationController_register",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/PublicRegistrationDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User registered successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuthResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad request"
            }
          },
          "summary": "Register a new user publicly",
          "tags": [
            "Public Registration"
          ]
        }
      },
      "/office-api/public-registration/pending": {
        "get": {
          "operationId": "PublicRegistrationController_getPendingRegistrations",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of pending OUTSIDER registrations",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/PendingRegistrationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all pending OUTSIDER registrations (Admin only)",
          "tags": [
            "Public Registration"
          ]
        }
      },
      "/office-api/public-registration/detail/{userId}": {
        "get": {
          "operationId": "PublicRegistrationController_getRegistrationDetail",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registration details",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RegistrationDetailResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get individual registration details (Admin only)",
          "tags": [
            "Public Registration"
          ]
        }
      },
      "/office-api/public-registration/verify/{userId}": {
        "post": {
          "operationId": "PublicRegistrationController_verifyRegistration",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyRegistrationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Registration verified successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Verify or reject a registration (Admin only)",
          "tags": [
            "Public Registration"
          ]
        }
      },
      "/office-api/mail/test-connection": {
        "get": {
          "operationId": "MailController_testSmtpConnection",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Mail"
          ]
        }
      },
      "/office-api/source-organizations": {
        "post": {
          "operationId": "SourceOrganizationsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSourceOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The source organization has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "409": {
              "description": "Source Organization with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new source organization",
          "tags": [
            "Source Organizations"
          ]
        },
        "get": {
          "operationId": "SourceOrganizationsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of source organizations.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all source organizations",
          "tags": [
            "Source Organizations"
          ]
        }
      },
      "/office-api/source-organizations/{id}": {
        "get": {
          "operationId": "SourceOrganizationsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "ID of the source organization",
              "schema": {
                "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The source organization with the specified ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a source organization by ID",
          "tags": [
            "Source Organizations"
          ]
        },
        "patch": {
          "operationId": "SourceOrganizationsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "ID of the source organization to update",
              "schema": {
                "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSourceOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The source organization has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Source Organization not found."
            },
            "409": {
              "description": "Source Organization with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing source organization by ID",
          "tags": [
            "Source Organizations"
          ]
        },
        "delete": {
          "operationId": "SourceOrganizationsController_delete",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "ID of the source organization to delete",
              "schema": {
                "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The source organization has been successfully deleted."
            },
            "404": {
              "description": "Source Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a source organization by ID",
          "tags": [
            "Source Organizations"
          ]
        }
      },
      "/office-api/users/import": {
        "post": {
          "operationId": "UsersController_importUsers",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "CSV file containing user data. Columns: username, email, fullName, isActive"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Summary of the import process.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "skipped": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "email": {
                              "type": "string"
                            },
                            "reason": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Unsupported file format or invalid data."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Import users from a CSV file",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/signatureFile/view": {
        "get": {
          "description": "Requires the full MinIO object key (path) as a query parameter.",
          "operationId": "UsersController_getFileViewUrl",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "The full MinIO object key /file_name.png)",
              "schema": {
                "example": "signatures/423c0f3c-4f4f-4b41-a30f-cbb6aa7dc450.png",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a backend URL.",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "url": {
                        "type": "string",
                        "format": "url",
                        "example": "/users/signatureFile/stream?path=signatures%2F423c0f3c-4f4f-4b41-a30f-cbb6aa7dc450.png"
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a backend stream URL to view a signature file.",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/signatureFile/stream": {
        "get": {
          "operationId": "UsersController_streamSignatureFile",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "The full MinIO object key (path).",
              "schema": {
                "example": "signatures/423c0f3c-4f4f-4b41-a30f-cbb6aa7dc450.png",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream a signature file through the backend",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/me/signature": {
        "patch": {
          "operationId": "UsersController_uploadSignature",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "The signature file to upload (PNG, JPG, JPEG, or PDF)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The signature has been successfully uploaded.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid file or file type."
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Upload a signature file for the authenticated user",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users": {
        "post": {
          "operationId": "UsersController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The user has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input (e.g., password criteria not met).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "User with this username or email already exists.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new user",
          "tags": [
            "Users"
          ]
        },
        "get": {
          "operationId": "UsersController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of users.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all users",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/me/subordinates": {
        "get": {
          "operationId": "UsersController_getSubordinateUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of users who are subordinates based on organization hierarchy.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserResponseDto"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all users in the authenticated user's organization and all descendant organizations, excluding the active user.",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/me/subordinates/workload": {
        "get": {
          "operationId": "UsersController_getSubordinateUsersWithWorkload",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of subordinate users with their current active (unfinished) job counts.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserWorkloadResponseDto"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all users in the authenticated user's organization and descendants, including their unfinished job counts.",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/{id}": {
        "get": {
          "operationId": "UsersController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The user found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "User not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a user by ID",
          "tags": [
            "Users"
          ]
        },
        "patch": {
          "operationId": "UsersController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The user has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "404": {
              "description": "User not found or invalid foreign keys.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "User with this username or email already exists.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a user by ID",
          "tags": [
            "Users"
          ]
        },
        "delete": {
          "operationId": "UsersController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The user has been successfully deleted."
            },
            "404": {
              "description": "User not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a user by ID",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/me/details": {
        "get": {
          "operationId": "UsersController_getMyDetails",
          "parameters": [],
          "responses": {
            "200": {
              "description": "The authenticated user's position, roles, and permissions.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserDetailsResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized."
            },
            "404": {
              "description": "User not found (should not happen for authenticated user)."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve the authenticated user's position, roles, and permissions",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/users/{userId}/details": {
        "get": {
          "operationId": "UsersController_getUserDetails",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "description": "The UUID of the user to retrieve details for",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The user's position, roles, and permissions.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserDetailsResponse"
                  }
                }
              }
            },
            "404": {
              "description": "User not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a user's position, roles, and permissions by user ID",
          "tags": [
            "Users"
          ]
        }
      },
      "/office-api/organizations": {
        "post": {
          "operationId": "OrganizationsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The organization has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "409": {
              "description": "Organization with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new organization",
          "tags": [
            "Organizations"
          ]
        },
        "get": {
          "operationId": "OrganizationsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of organizations.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organizations",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/ancestors": {
        "get": {
          "operationId": "OrganizationsController_getOrganizationsAbove",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of organizations in the hierarchy above the user.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organizations above the user's organization in the hierarchy.",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/descendants": {
        "get": {
          "operationId": "OrganizationsController_getOrganizationsUnder",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of organizations in the hierarchy under the user.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organizations under the user's organization in the hierarchy.",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/record-offices": {
        "get": {
          "operationId": "OrganizationsController_getRecordOffices",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of record office organizations.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organizations that are designated as a record office",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/embassies": {
        "get": {
          "operationId": "OrganizationsController_getEmbassies",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of embassy organizations.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organizations that are designated as embassies",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/active": {
        "get": {
          "operationId": "OrganizationsController_findActiveOrganizations",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of active organizations.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all active organizations",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/{id}": {
        "get": {
          "operationId": "OrganizationsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The organization found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an organization by ID",
          "tags": [
            "Organizations"
          ]
        },
        "patch": {
          "operationId": "OrganizationsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The organization has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "Organization not found."
            },
            "409": {
              "description": "Organization with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an organization by ID",
          "tags": [
            "Organizations"
          ]
        },
        "delete": {
          "operationId": "OrganizationsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The organization has been successfully deleted."
            },
            "404": {
              "description": "Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an organization by ID",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/{id}/hierarchy": {
        "get": {
          "operationId": "OrganizationsController_findHierarchy",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of organizations in the hierarchy.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve organization hierarchy by ID",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/{id}/activate": {
        "patch": {
          "operationId": "OrganizationsController_activate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The organization has been successfully activated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Activate an organization by ID",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/organizations/{id}/deactivate": {
        "patch": {
          "operationId": "OrganizationsController_deactivate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The organization has been successfully deactivated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Deactivate an organization by ID",
          "tags": [
            "Organizations"
          ]
        }
      },
      "/office-api/positions": {
        "post": {
          "operationId": "PositionsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePositionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The position has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PositionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "409": {
              "description": "Position with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new position",
          "tags": [
            "Positions"
          ]
        },
        "get": {
          "operationId": "PositionsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of positions.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/PositionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all positions",
          "tags": [
            "Positions"
          ]
        }
      },
      "/office-api/positions/{id}": {
        "get": {
          "operationId": "PositionsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the position",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The position found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PositionResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Position not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a position by ID",
          "tags": [
            "Positions"
          ]
        },
        "patch": {
          "operationId": "PositionsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the position",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePositionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The position has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PositionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "Position not found."
            },
            "409": {
              "description": "Position with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a position by ID",
          "tags": [
            "Positions"
          ]
        },
        "delete": {
          "operationId": "PositionsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the position",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The position has been successfully deleted."
            },
            "404": {
              "description": "Position not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a position by ID",
          "tags": [
            "Positions"
          ]
        }
      },
      "/office-api/organization-positions": {
        "post": {
          "operationId": "OrganizationPositionsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateOrganizationPositionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The organization-position assignment has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input (e.g., non-existent IDs).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "404": {
              "description": "One or both of the provided OrganizationID or PositionID do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This organization already has this position assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign a position to an organization",
          "tags": [
            "Organization Positions"
          ]
        },
        "get": {
          "operationId": "OrganizationPositionsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of organization-position assignments.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all organization-position assignments",
          "tags": [
            "Organization Positions"
          ]
        }
      },
      "/office-api/organization-positions/{id}": {
        "get": {
          "operationId": "OrganizationPositionsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization-position assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The organization-position assignment found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "OrganizationPosition not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an organization-position assignment by ID",
          "tags": [
            "Organization Positions"
          ]
        },
        "patch": {
          "operationId": "OrganizationPositionsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization-position assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateOrganizationPositionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The organization-position assignment has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "OrganizationPosition not found or invalid foreign keys.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This organization already has this position assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an organization-position assignment by ID",
          "tags": [
            "Organization Positions"
          ]
        },
        "delete": {
          "operationId": "OrganizationPositionsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization-position assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The organization-position assignment has been successfully deleted."
            },
            "404": {
              "description": "OrganizationPosition not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an organization-position assignment by ID",
          "tags": [
            "Organization Positions"
          ]
        }
      },
      "/office-api/roles": {
        "post": {
          "operationId": "RolesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRoleDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The role has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RoleResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "409": {
              "description": "Role with this name already exists.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "statusCode": {
                        "type": "number",
                        "example": 409
                      },
                      "message": {
                        "type": "string",
                        "example": "Role with this name already exists."
                      },
                      "error": {
                        "type": "string",
                        "example": "Conflict"
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new role",
          "tags": [
            "Roles"
          ]
        },
        "get": {
          "operationId": "RolesController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of roles.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RoleResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all roles",
          "tags": [
            "Roles"
          ]
        }
      },
      "/office-api/roles/{id}": {
        "get": {
          "operationId": "RolesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The role found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RoleResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Role not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a role by ID",
          "tags": [
            "Roles"
          ]
        },
        "patch": {
          "operationId": "RolesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRoleDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The role has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RoleResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "Role not found."
            },
            "409": {
              "description": "Role with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a role by ID",
          "tags": [
            "Roles"
          ]
        },
        "delete": {
          "operationId": "RolesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The role has been successfully deleted."
            },
            "404": {
              "description": "Role not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a role by ID",
          "tags": [
            "Roles"
          ]
        }
      },
      "/office-api/user-roles": {
        "post": {
          "operationId": "UserRolesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserRoleDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The user-role assignment has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserRoleResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "404": {
              "description": "One or both of the provided UserID or RoleID do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This user already has this role assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign a role to a user",
          "tags": [
            "User Roles"
          ]
        },
        "get": {
          "operationId": "UserRolesController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of user-role assignments.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserRoleResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all user-role assignments",
          "tags": [
            "User Roles"
          ]
        }
      },
      "/office-api/user-roles/{id}": {
        "get": {
          "operationId": "UserRolesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user-role assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The user-role assignment found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserRoleResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "UserRole not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a user-role assignment by ID",
          "tags": [
            "User Roles"
          ]
        },
        "patch": {
          "operationId": "UserRolesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user-role assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserRoleDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The user-role assignment has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserRoleResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "UserRole not found or invalid foreign keys.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This user already has this role assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a user-role assignment by ID",
          "tags": [
            "User Roles"
          ]
        },
        "delete": {
          "operationId": "UserRolesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the user-role assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The user-role assignment has been successfully deleted."
            },
            "404": {
              "description": "UserRole not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a user-role assignment by ID",
          "tags": [
            "User Roles"
          ]
        }
      },
      "/office-api/user-roles/user/{userId}": {
        "get": {
          "operationId": "UserRolesController_findByUserId",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "description": "The UUID of the user",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of roles for the specified user.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserRoleResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all roles for a specific user",
          "tags": [
            "User Roles"
          ]
        }
      },
      "/office-api/user-roles/user/{userId}/role/{roleId}": {
        "delete": {
          "operationId": "UserRolesController_removeRoleForUser",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "description": "The UUID of the user",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The user-role assignment has been successfully deleted."
            },
            "404": {
              "description": "UserRole not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a specific role for a user",
          "tags": [
            "User Roles"
          ]
        }
      },
      "/office-api/permissions": {
        "post": {
          "operationId": "PermissionsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePermissionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The permission has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PermissionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "409": {
              "description": "Permission with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new permission",
          "tags": [
            "Permissions"
          ]
        },
        "get": {
          "operationId": "PermissionsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of permissions.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/PermissionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all permissions",
          "tags": [
            "Permissions"
          ]
        }
      },
      "/office-api/permissions/operation-check/{permissionKey}": {
        "get": {
          "description": "Returns { hasPermission: true/false } based on the user's organization position capabilities.",
          "operationId": "PermissionsController_checkOperationPermission",
          "parameters": [
            {
              "name": "permissionKey",
              "required": true,
              "in": "path",
              "description": "The operation permission to check. Must be one of: canCreateOutgoing, canEscalateOutgoing, canForwardOutgoing, canDispatchOutgoing, canReturnOutgoing, canTransferOutgoing, canReturnIncoming, canAcceptIncoming, canReplyIncoming, canForwardIncoming, canTransferIncoming, canForwardToRecordOffice, canViewForwardedOutgoing, canViewEscalatedOutgoing, canViewOutgoing, canViewRecordOffices, canCreateJobAssignment, canViewJobAssignment, canDeleteJobAssignment, canViewReport",
              "schema": {
                "example": "canCreateOutgoing",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Permission check result.",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "hasPermission": {
                        "type": "boolean",
                        "example": true
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Check if the logged-in user has a specific operation permission.",
          "tags": [
            "Permissions"
          ]
        }
      },
      "/office-api/permissions/check-permission": {
        "get": {
          "description": "Returns true or false if the logged-in user has the permission specified by the query parameter.",
          "operationId": "PermissionsController_checkPermission",
          "parameters": [
            {
              "name": "permissionName",
              "required": true,
              "in": "query",
              "description": "The permission string to check (e.g., update-outgoing-letter).",
              "schema": {
                "example": "update-outgoing-letter",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns true if the user has the permission, false otherwise.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "hasPermission": {
                        "type": "boolean",
                        "example": true
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Checks if the logged-in user has a specific permission.",
          "tags": [
            "Permissions"
          ]
        }
      },
      "/office-api/permissions/{id}": {
        "get": {
          "operationId": "PermissionsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the permission",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The permission found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PermissionResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Permission not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a permission by ID",
          "tags": [
            "Permissions"
          ]
        },
        "patch": {
          "operationId": "PermissionsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the permission",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePermissionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The permission has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PermissionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "Permission not found."
            },
            "409": {
              "description": "Permission with this name already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a permission by ID",
          "tags": [
            "Permissions"
          ]
        },
        "delete": {
          "operationId": "PermissionsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the permission",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The permission has been successfully deleted."
            },
            "404": {
              "description": "Permission not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a permission by ID",
          "tags": [
            "Permissions"
          ]
        }
      },
      "/office-api/role-permissions/add-to-role/{roleId}": {
        "post": {
          "operationId": "RolePermissionsController_addPermissionsToRole",
          "parameters": [
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SyncRolePermissionsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Permissions added successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RolePermissionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Add multiple permissions to an existing role without removing existing ones",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/role-permissions/assign-many": {
        "post": {
          "operationId": "RolePermissionsController_createMany",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRolePermissionsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Permissions have been successfully assigned to the role.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RolePermissionResponseDto"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "One or more of the provided RoleID or PermissionIDs do not exist."
            },
            "409": {
              "description": "One or more permissions are already assigned to this role."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign multiple permissions to a role",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/role-permissions": {
        "post": {
          "operationId": "RolePermissionsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRolePermissionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The role-permission assignment has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RolePermissionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "404": {
              "description": "One or both of the provided RoleID or PermissionID do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This role already has this permission assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign a permission to a role",
          "tags": [
            "Role Permissions"
          ]
        },
        "get": {
          "operationId": "RolePermissionsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of role-permission assignments.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RolePermissionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all role-permission assignments",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/role-permissions/{id}": {
        "get": {
          "operationId": "RolePermissionsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role-permission assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The role-permission assignment found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RolePermissionResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "RolePermission not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a role-permission assignment by ID",
          "tags": [
            "Role Permissions"
          ]
        },
        "patch": {
          "operationId": "RolePermissionsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role-permission assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRolePermissionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The role-permission assignment has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RolePermissionResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input."
            },
            "404": {
              "description": "RolePermission not found or invalid foreign keys.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "409": {
              "description": "This role already has this permission assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a role-permission assignment by ID",
          "tags": [
            "Role Permissions"
          ]
        },
        "delete": {
          "operationId": "RolePermissionsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the role-permission assignment",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "The role-permission assignment has been successfully deleted."
            },
            "404": {
              "description": "RolePermission not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a role-permission assignment by ID",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/role-permissions/sync/{roleId}": {
        "patch": {
          "operationId": "RolePermissionsController_syncRolePermissions",
          "parameters": [
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SyncRolePermissionsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role permissions synchronized successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RolePermissionResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Role not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Synchronize role permissions with provided list",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/role-permissions/role/{roleId}": {
        "get": {
          "operationId": "RolePermissionsController_findPermissionsByRoleId",
          "parameters": [
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "description": "The UUID of the role",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of permissions for the specified role.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RolePermissionResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "List all permissions under a specific role",
          "tags": [
            "Role Permissions"
          ]
        }
      },
      "/office-api/priorities": {
        "post": {
          "operationId": "PriorityController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePriorityDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The priority has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new priority",
          "tags": [
            "Priorities"
          ]
        },
        "get": {
          "operationId": "PriorityController_findAll",
          "parameters": [
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by Priority ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by priority name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "description",
              "required": false,
              "in": "query",
              "description": "Filter by description (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by Priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by priority name (case-insensitive partial match)",
              "required": false,
              "name": "name",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by description (case-insensitive partial match)",
              "required": false,
              "name": "description",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of priorities."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all priorities, optionally filtered",
          "tags": [
            "Priorities"
          ]
        }
      },
      "/office-api/priorities/{id}": {
        "get": {
          "operationId": "PriorityController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the priority to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the priority."
            },
            "404": {
              "description": "Priority not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a priority by ID",
          "tags": [
            "Priorities"
          ]
        },
        "patch": {
          "operationId": "PriorityController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the priority to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePriorityDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The priority has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Priority not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing priority by ID",
          "tags": [
            "Priorities"
          ]
        },
        "delete": {
          "operationId": "PriorityController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the priority to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The priority has been successfully deleted."
            },
            "404": {
              "description": "Priority not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a priority by ID",
          "tags": [
            "Priorities"
          ]
        }
      },
      "/office-api/confidentialities": {
        "post": {
          "operationId": "ConfidentialityController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateConfidentialityDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The confidentiality level has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new confidentiality level",
          "tags": [
            "Confidentialities"
          ]
        },
        "get": {
          "operationId": "ConfidentialityController_findAll",
          "parameters": [
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by Confidentiality ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by confidentiality name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "description",
              "required": false,
              "in": "query",
              "description": "Filter by description (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by Confidentiality ID",
              "required": false,
              "name": "confidentialityId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by confidentiality name (case-insensitive partial match)",
              "required": false,
              "name": "name",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by description (case-insensitive partial match)",
              "required": false,
              "name": "description",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of confidentiality levels."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all confidentiality levels, optionally filtered",
          "tags": [
            "Confidentialities"
          ]
        }
      },
      "/office-api/confidentialities/{id}": {
        "get": {
          "operationId": "ConfidentialityController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the confidentiality level to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the confidentiality level."
            },
            "404": {
              "description": "Confidentiality level not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a confidentiality level by ID",
          "tags": [
            "Confidentialities"
          ]
        },
        "patch": {
          "operationId": "ConfidentialityController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the confidentiality level to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateConfidentialityDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The confidentiality level has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Confidentiality level not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing confidentiality level by ID",
          "tags": [
            "Confidentialities"
          ]
        },
        "delete": {
          "operationId": "ConfidentialityController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the confidentiality level to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The confidentiality level has been successfully deleted."
            },
            "404": {
              "description": "Confidentiality level not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a confidentiality level by ID",
          "tags": [
            "Confidentialities"
          ]
        }
      },
      "/office-api/languages": {
        "post": {
          "operationId": "LanguageController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLanguageDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The language has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new language",
          "tags": [
            "Languages"
          ]
        },
        "get": {
          "operationId": "LanguageController_findAll",
          "parameters": [
            {
              "name": "languageId",
              "required": false,
              "in": "query",
              "description": "Filter by Language ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by language name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "description",
              "required": false,
              "in": "query",
              "description": "Filter by description (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by Language ID",
              "required": false,
              "name": "languageId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by language name (case-insensitive partial match)",
              "required": false,
              "name": "name",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by description (case-insensitive partial match)",
              "required": false,
              "name": "description",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of languages."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all languages, optionally filtered",
          "tags": [
            "Languages"
          ]
        }
      },
      "/office-api/languages/{id}": {
        "get": {
          "operationId": "LanguageController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the language to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the language."
            },
            "404": {
              "description": "Language not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a language by ID",
          "tags": [
            "Languages"
          ]
        },
        "patch": {
          "operationId": "LanguageController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the language to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLanguageDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The language has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Language not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing language by ID",
          "tags": [
            "Languages"
          ]
        },
        "delete": {
          "operationId": "LanguageController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the language to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The language has been successfully deleted."
            },
            "404": {
              "description": "Language not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a language by ID",
          "tags": [
            "Languages"
          ]
        }
      },
      "/office-api/document-categories": {
        "post": {
          "operationId": "DocumentCategoryController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateDocumentCategoryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The document category has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new document category",
          "tags": [
            "Document Categories"
          ]
        },
        "get": {
          "operationId": "DocumentCategoryController_findAll",
          "parameters": [
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by Document Category ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by document category name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "description",
              "required": false,
              "in": "query",
              "description": "Filter by description (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "code",
              "required": false,
              "in": "query",
              "description": "Filter by category code (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "level",
              "required": false,
              "in": "query",
              "description": "Filter by hierarchy level (1=Series, 2=Subseries, 3=Files)",
              "schema": {
                "type": "number"
              }
            },
            {
              "description": "Filter by Document Category ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by document category name (case-insensitive partial match)",
              "required": false,
              "name": "name",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by description (case-insensitive partial match)",
              "required": false,
              "name": "description",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by category code (case-insensitive partial match)",
              "required": false,
              "name": "code",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by hierarchy level (1=Series, 2=Subseries, 3=Files)",
              "required": false,
              "name": "level",
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of document categories."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all document categories, optionally filtered",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/hierarchical": {
        "get": {
          "operationId": "DocumentCategoryController_getHierarchical",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Hierarchical categories retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get hierarchical document categories",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/level/{level}": {
        "get": {
          "operationId": "DocumentCategoryController_getCategoriesByLevel",
          "parameters": [
            {
              "name": "level",
              "required": true,
              "in": "path",
              "description": "Hierarchy level (1=Series, 2=Subseries, 3=Files)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Categories by level retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get categories by hierarchy level",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/statistics": {
        "get": {
          "operationId": "DocumentCategoryController_getStatistics",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Category statistics retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get document category statistics",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/{id}": {
        "get": {
          "operationId": "DocumentCategoryController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the document category.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DocumentCategoryResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Document category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a document category by ID",
          "tags": [
            "Document Categories"
          ]
        },
        "patch": {
          "operationId": "DocumentCategoryController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateDocumentCategoryDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The document category has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Document category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing document category by ID",
          "tags": [
            "Document Categories"
          ]
        },
        "delete": {
          "operationId": "DocumentCategoryController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The document category has been successfully deleted."
            },
            "404": {
              "description": "Document category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a document category by ID",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/{id}/assign-record-offices": {
        "post": {
          "operationId": "DocumentCategoryController_assignRecordOffices",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "recordOfficeIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Array of record office organization IDs to assign"
                    }
                  },
                  "required": [
                    "recordOfficeIds"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Record offices successfully assigned to the document category.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DocumentCategoryResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign record offices to a document category",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/document-categories/{id}/record-offices": {
        "get": {
          "operationId": "DocumentCategoryController_getRecordOfficeAssignments",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Record office assignments retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "recordOfficeAssignments": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "organizationId": {
                              "type": "string"
                            },
                            "organization": {
                              "type": "object",
                              "properties": {
                                "organizationId": {
                                  "type": "string"
                                },
                                "organizationName": {
                                  "type": "string"
                                }
                              }
                            },
                            "assignedAt": {
                              "type": "string",
                              "format": "date-time"
                            },
                            "isActive": {
                              "type": "boolean"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get record offices assigned to a document category",
          "tags": [
            "Document Categories"
          ]
        }
      },
      "/office-api/documents": {
        "post": {
          "operationId": "DocumentController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/CreateDocumentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The document has been successfully created."
            },
            "400": {
              "description": "Invalid input data or file upload issue."
            },
            "404": {
              "description": "One or more foreign key entities (Priority, Confidentiality, Language, Document Category) not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new document with file uploads",
          "tags": [
            "Documents"
          ]
        },
        "get": {
          "operationId": "DocumentController_findAll",
          "parameters": [
            {
              "name": "documentId",
              "required": false,
              "in": "query",
              "description": "Filter by Document ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentSubject",
              "required": false,
              "in": "query",
              "description": "Filter by document subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "internalTrackingNumber",
              "required": false,
              "in": "query",
              "description": "Filter by internal tracking number (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by Priority ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by Confidentiality ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "languageId",
              "required": false,
              "in": "query",
              "description": "Filter by Language ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by Document Category ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "receivedUserId",
              "required": false,
              "in": "query",
              "description": "Filter by received user ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentYear",
              "required": false,
              "in": "query",
              "description": "Filter by document year (YYYY-MM-DD format)",
              "schema": {
                "format": "date",
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by Source Organization ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by document status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "FILES_VERIFIED",
                  "VERIFIED",
                  "METADATA_REJECTED",
                  "REJECTED",
                  "AUTHORIZED",
                  "REJECTED_BY_APPROVER",
                  "REJECTED_BY_AUTHORIZER"
                ]
              }
            },
            {
              "name": "country",
              "required": false,
              "in": "query",
              "description": "Filter by country (case-insensitive partial match)",
              "schema": {
                "example": "Ethiopia",
                "type": "string"
              }
            },
            {
              "name": "tags",
              "required": false,
              "in": "query",
              "description": "Filter by tags (documents containing any of these tags)",
              "schema": {
                "example": [
                  "finance",
                  "annual"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            {
              "description": "Filter by Document ID",
              "required": false,
              "name": "documentId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by document subject (case-insensitive partial match)",
              "required": false,
              "name": "documentSubject",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by reference number (case-insensitive partial match)",
              "required": false,
              "name": "referenceNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by internal tracking number (case-insensitive partial match)",
              "required": false,
              "name": "internalTrackingNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by Priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by Confidentiality ID",
              "required": false,
              "name": "confidentialityId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by Language ID",
              "required": false,
              "name": "languageId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by Document Category ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by received user ID",
              "required": false,
              "name": "receivedUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by document year (YYYY-MM-DD format)",
              "required": false,
              "name": "documentYear",
              "in": "query",
              "schema": {
                "format": "date",
                "type": "string"
              }
            },
            {
              "description": "Filter by Source Organization ID",
              "required": false,
              "name": "sourceOrganizationId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by document status",
              "required": false,
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by country (case-insensitive partial match)",
              "required": false,
              "name": "country",
              "in": "query",
              "schema": {
                "example": "Ethiopia",
                "type": "string"
              }
            },
            {
              "description": "Filter by tags (documents containing any of these tags)",
              "required": false,
              "name": "tags",
              "in": "query",
              "schema": {
                "example": [
                  "finance",
                  "annual"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of documents."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all documents, optionally filtered",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{id}": {
        "get": {
          "operationId": "DocumentController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the document."
            },
            "404": {
              "description": "Document not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a document by ID",
          "tags": [
            "Documents"
          ]
        },
        "patch": {
          "operationId": "DocumentController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateDocumentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The document has been successfully updated."
            },
            "400": {
              "description": "Invalid input data or file upload issue."
            },
            "404": {
              "description": "Document not found or one or more foreign key entities not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing document by ID with optional file replacement",
          "tags": [
            "Documents"
          ]
        },
        "delete": {
          "operationId": "DocumentController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The document and its files have been successfully deleted."
            },
            "404": {
              "description": "Document not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a document by ID and its associated files from MinIO",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/category/{categoryId}": {
        "get": {
          "operationId": "DocumentController_findByCategory",
          "parameters": [
            {
              "name": "categoryId",
              "required": true,
              "in": "path",
              "description": "Document category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentId",
              "required": false,
              "in": "query",
              "description": "Filter by Document ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentSubject",
              "required": false,
              "in": "query",
              "description": "Filter by document subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "internalTrackingNumber",
              "required": false,
              "in": "query",
              "description": "Filter by internal tracking number (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by Priority ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by Confidentiality ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "languageId",
              "required": false,
              "in": "query",
              "description": "Filter by Language ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by Document Category ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "receivedUserId",
              "required": false,
              "in": "query",
              "description": "Filter by received user ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentYear",
              "required": false,
              "in": "query",
              "description": "Filter by document year (YYYY-MM-DD format)",
              "schema": {
                "format": "date",
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by Source Organization ID",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by document status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "FILES_VERIFIED",
                  "VERIFIED",
                  "METADATA_REJECTED",
                  "REJECTED",
                  "AUTHORIZED",
                  "REJECTED_BY_APPROVER",
                  "REJECTED_BY_AUTHORIZER"
                ]
              }
            },
            {
              "name": "country",
              "required": false,
              "in": "query",
              "description": "Filter by country (case-insensitive partial match)",
              "schema": {
                "example": "Ethiopia",
                "type": "string"
              }
            },
            {
              "name": "tags",
              "required": false,
              "in": "query",
              "description": "Filter by tags (documents containing any of these tags)",
              "schema": {
                "example": [
                  "finance",
                  "annual"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Documents retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get documents by category (including subcategories)",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{id}/history": {
        "get": {
          "operationId": "DocumentController_findHistory",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document to retrieve history for.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the document history."
            },
            "404": {
              "description": "Document not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve the history of a document by ID",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{id}/verify-file": {
        "patch": {
          "operationId": "DocumentController_verifyDocumentFile",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fileId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The UUID of the file to verify."
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "VERIFIED",
                        "REJECTED"
                      ]
                    }
                  },
                  "required": [
                    "fileId",
                    "status"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The file has been successfully verified or rejected."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Verify or reject a single document file by ID",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{id}/verify-metadata": {
        "patch": {
          "description": "This endpoint allows verifiers to approve or reject the document metadata (category, subject, reference, etc.) as a whole after all individual files have been verified.",
          "operationId": "DocumentController_verifyDocumentMetadata",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyMetadataDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The document metadata has been successfully verified or rejected."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Verify or reject document metadata after all files have been verified",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{documentId}/files/{fileId}/resubmit": {
        "post": {
          "operationId": "DocumentController_resubmitRejectedFile",
          "parameters": [
            {
              "name": "documentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the document",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "fileId",
              "required": true,
              "in": "path",
              "description": "The UUID of the rejected file to resubmit",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "The new file to replace the rejected one"
                    }
                  },
                  "required": [
                    "file"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Resubmit a single rejected file for a document",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{id}/authorize": {
        "patch": {
          "operationId": "DocumentController_authorizeDocument",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document to authorize.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "AUTHORIZED",
                        "REJECTED"
                      ],
                      "description": "The status to set for the document."
                    }
                  },
                  "required": [
                    "status"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The document has been successfully authorized."
            },
            "400": {
              "description": "Document is not approved or already authorized."
            },
            "404": {
              "description": "Document not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Authorize a document by ID",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/view/view-file": {
        "get": {
          "operationId": "DocumentController_viewFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path (e.g., main-documents/filename.pdf)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a backend URL to view the file.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "url": "/documents/files/stream?filePath=main-documents%2Ffilename.pdf"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "View document file through the backend stream URL",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/files/stream": {
        "get": {
          "operationId": "DocumentController_streamFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path (e.g., main-documents/filename.pdf)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File streamed successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream a document file through the backend",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/download/download-file": {
        "get": {
          "description": "Downloads a document file given its file path.",
          "operationId": "DocumentController_downloadDocumentFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The MinIO object path (e.g., main-documents/filename.pdf)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File downloaded successfully.",
              "content": {
                "application/octet-stream": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "404": {
              "description": "File not found."
            },
            "500": {
              "description": "Server error."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Download a file from MinIO",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/{documentId}/verified": {
        "get": {
          "operationId": "DocumentController_getVerifiedDocumentById",
          "parameters": [
            {
              "name": "documentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the document from the QR code",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns the verified document and its supporting documents."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get verified document and its supporting documents by document ID (QR code endpoint)",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/encoded-by/me": {
        "get": {
          "operationId": "DocumentController_getMyEncodedDocuments",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns documents encoded by the logged-in user"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get documents encoded by the logged-in user",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/documents/encoded-by/{userId}": {
        "get": {
          "operationId": "DocumentController_getEncodedDocumentsByUser",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns documents encoded by the specified user"
            },
            "404": {
              "description": "User not found or no documents encoded"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get documents encoded by a specific user",
          "tags": [
            "Documents"
          ]
        }
      },
      "/office-api/notifications": {
        "post": {
          "operationId": "NotificationController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateNotificationDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Notification created successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new notification",
          "tags": [
            "notifications"
          ]
        },
        "get": {
          "operationId": "NotificationController_findAll",
          "parameters": [
            {
              "name": "isRead",
              "required": false,
              "in": "query",
              "description": "Filter by read status",
              "schema": {
                "example": false,
                "type": "boolean"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter by notification type",
              "schema": {
                "example": "document",
                "type": "string",
                "enum": [
                  "workflow",
                  "assignment",
                  "delegation",
                  "general",
                  "document"
                ]
              }
            },
            {
              "name": "relatedEntityId",
              "required": false,
              "in": "query",
              "description": "Filter by related entity ID",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "relatedEntityType",
              "required": false,
              "in": "query",
              "description": "Filter by related entity type",
              "schema": {
                "example": "document",
                "type": "string",
                "enum": [
                  "incoming_letter",
                  "outgoing_letter",
                  "document"
                ]
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of notifications to return",
              "schema": {
                "default": 50,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "offset",
              "required": false,
              "in": "query",
              "description": "Number of notifications to skip",
              "schema": {
                "default": 0,
                "example": 0,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of notifications"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get notifications for the current user",
          "tags": [
            "notifications"
          ]
        },
        "delete": {
          "operationId": "NotificationController_removeAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "All notifications deleted successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete all notifications for the current user",
          "tags": [
            "notifications"
          ]
        }
      },
      "/office-api/notifications/unread-count": {
        "get": {
          "operationId": "NotificationController_getUnreadCount",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unread notifications"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unread notifications",
          "tags": [
            "notifications"
          ]
        }
      },
      "/office-api/notifications/{id}": {
        "get": {
          "operationId": "NotificationController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Notification details"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a specific notification",
          "tags": [
            "notifications"
          ]
        },
        "delete": {
          "operationId": "NotificationController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Notification deleted successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a notification",
          "tags": [
            "notifications"
          ]
        }
      },
      "/office-api/notifications/{id}/read": {
        "patch": {
          "operationId": "NotificationController_markAsRead",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Notification marked as read"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Mark notification as read",
          "tags": [
            "notifications"
          ]
        }
      },
      "/office-api/notifications/mark-all-read": {
        "patch": {
          "operationId": "NotificationController_markAllAsRead",
          "parameters": [],
          "responses": {
            "200": {
              "description": "All notifications marked as read"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Mark all notifications as read",
          "tags": [
            "notifications"
          ]
        }
      },
      "/office-api/shelves": {
        "post": {
          "operationId": "ShelfController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateShelfDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Shelf has been successfully created."
            },
            "404": {
              "description": "Location not found."
            },
            "409": {
              "description": "Shelf with this number already exists in the location."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new shelf",
          "tags": [
            "Shelves"
          ]
        },
        "get": {
          "operationId": "ShelfController_findAll",
          "parameters": [
            {
              "name": "recordCenterId",
              "required": false,
              "in": "query",
              "description": "Filter by record center ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "shelfNumber",
              "required": false,
              "in": "query",
              "description": "Filter by shelf number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "shelfType",
              "required": false,
              "in": "query",
              "description": "Filter by shelf type",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "description": "Filter by active status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "availableOnly",
              "required": false,
              "in": "query",
              "description": "Show only available shelves",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "includeRows",
              "required": false,
              "in": "query",
              "description": "Include shelf rows information",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "locationId",
              "required": false,
              "in": "query",
              "description": "Filter by location ID",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "List of shelves retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all shelves",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/available-rows": {
        "get": {
          "description": "Returns available shelf rows grouped by record center, then by shelf number, then by row number",
          "operationId": "ShelfController_getAvailableShelfRows",
          "parameters": [
            {
              "name": "recordCenterId",
              "required": false,
              "in": "query",
              "description": "Filter by record center ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Available shelf rows retrieved successfully in hierarchical format.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/HierarchicalShelfAvailabilityDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get available shelf rows organized hierarchically by record center and shelf",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/available-rows/flat": {
        "get": {
          "description": "Returns available shelf rows as a flat array for dropdown usage",
          "operationId": "ShelfController_getAvailableShelfRowsFlat",
          "parameters": [
            {
              "name": "recordCenterId",
              "required": false,
              "in": "query",
              "description": "Filter by record center ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Available shelf rows retrieved successfully in flat format.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/ShelfAvailabilityDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get available shelf rows in flat format (backward compatibility)",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/reserve/{shelfRowId}": {
        "post": {
          "operationId": "ShelfController_reserveShelfRow",
          "parameters": [
            {
              "name": "shelfRowId",
              "required": true,
              "in": "path",
              "description": "Shelf row ID to reserve",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Shelf row reserved successfully."
            },
            "404": {
              "description": "Shelf row not found."
            },
            "409": {
              "description": "Shelf row is already occupied or reserved."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Reserve a shelf row for document assignment",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/release/{shelfRowId}": {
        "post": {
          "operationId": "ShelfController_releaseShelfRow",
          "parameters": [
            {
              "name": "shelfRowId",
              "required": true,
              "in": "path",
              "description": "Shelf row ID to release",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Shelf row reservation released successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Release a shelf row reservation",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/cleanup-reservations": {
        "post": {
          "operationId": "ShelfController_cleanupExpiredReservations",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Expired reservations cleaned up successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Cleanup expired shelf reservations",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/shelves/{id}": {
        "get": {
          "operationId": "ShelfController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Shelf ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Shelf retrieved successfully."
            },
            "404": {
              "description": "Shelf not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a shelf by ID",
          "tags": [
            "Shelves"
          ]
        },
        "patch": {
          "operationId": "ShelfController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Shelf ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateShelfDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Shelf has been successfully updated."
            },
            "400": {
              "description": "Cannot reduce capacity below current usage."
            },
            "404": {
              "description": "Shelf not found."
            },
            "409": {
              "description": "Shelf with this number already exists in the location."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a shelf",
          "tags": [
            "Shelves"
          ]
        },
        "delete": {
          "operationId": "ShelfController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Shelf ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Shelf has been successfully deleted."
            },
            "404": {
              "description": "Shelf not found."
            },
            "409": {
              "description": "Cannot delete shelf with occupied rows."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a shelf",
          "tags": [
            "Shelves"
          ]
        }
      },
      "/office-api/task-management/getAllTasks": {
        "get": {
          "operationId": "TaskManagementController_getAllTasks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all tasks",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/countTasks": {
        "get": {
          "operationId": "TaskManagementController_countTasks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Count all tasks",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/countPendingTasks": {
        "get": {
          "operationId": "TaskManagementController_countPendingTasks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Count all my pending tasks",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/countUncompletedTasks": {
        "get": {
          "operationId": "TaskManagementController_countUncompletedTasks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Count all my uncompleted tasks",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/assignRandomTask": {
        "get": {
          "operationId": "TaskManagementController_assignRandomTask",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign me to random task",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/{id}/assignUserToTask": {
        "patch": {
          "operationId": "TaskManagementController_assignUserToTask",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AssignUserToTaskDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign user to task",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/{id}/getEligibleUsersForTask": {
        "get": {
          "operationId": "TaskManagementController_getEligibleUsersForTask",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get eligible users for a task",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/getAllMyTasks": {
        "get": {
          "operationId": "TaskManagementController_getAllMyTasks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all my tasks",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/checkCanDoTask": {
        "post": {
          "operationId": "TaskManagementController_checkCanDoTask",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CheckCanDoTaskDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Check if user can perform this task",
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/task-management/create": {
        "post": {
          "operationId": "TaskManagementController_createTask",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateTaskManagementDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "tags": [
            "TaskManagement"
          ]
        }
      },
      "/office-api/document-requests": {
        "post": {
          "description": "Users without direct access can submit a request for a document. Admin approval is required. The user only provides a general topic and description, not document IDs or names.",
          "operationId": "DocumentRequestController_createRequest",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document request successfully created."
            },
            "400": {
              "description": "Invalid request data."
            },
            "500": {
              "description": "Failed to create document request."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Request access to a document by topic/description",
          "tags": [
            "Document Requests"
          ]
        },
        "get": {
          "operationId": "DocumentRequestController_getAllRequests",
          "parameters": [
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by request status.",
              "schema": {
                "enum": [
                  "PENDING",
                  "VERIFIED",
                  "APPROVED",
                  "REJECTED",
                  "EXPIRED",
                  "DELETED"
                ],
                "type": "string"
              }
            },
            {
              "name": "requestedByUserId",
              "required": false,
              "in": "query",
              "description": "Filter by ID of the user who made the request.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "requestTopic",
              "required": false,
              "in": "query",
              "description": "Filter by the topic of the request (case-insensitive contains).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved all document requests."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all document requests .",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}/verify": {
        "patch": {
          "description": "Marks a document request as verified. Optionally include a comment explaining the verification.",
          "operationId": "DocumentRequestController_verifyRequest",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request to verify.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document request successfully verified."
            },
            "400": {
              "description": "Request has already been verified."
            },
            "404": {
              "description": "Document request not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Verify a document request.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/record-office/verified": {
        "get": {
          "description": "This endpoint is for record office staff to see requests they are responsible for approving.",
          "operationId": "DocumentRequestController_getVerifiedRequestsForRecordOffice",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved verified document requests for the record office."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve verified document requests assigned to the active user's record office.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/verified-pending": {
        "get": {
          "description": "Admins can use this to view a list of requests that are ready for the approval process.",
          "operationId": "DocumentRequestController_getVerifiedRequests",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved verified document requests."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all verified document requests that are pending approval.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/my-requests": {
        "get": {
          "operationId": "DocumentRequestController_getMyRequests",
          "parameters": [
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by request status.",
              "schema": {
                "enum": [
                  "PENDING",
                  "VERIFIED",
                  "APPROVED",
                  "REJECTED",
                  "EXPIRED",
                  "DELETED"
                ],
                "type": "string"
              }
            },
            {
              "name": "requestedByUserId",
              "required": false,
              "in": "query",
              "description": "Filter by ID of the user who made the request.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "requestTopic",
              "required": false,
              "in": "query",
              "description": "Filter by the topic of the request (case-insensitive contains).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved user document requests."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve requests made by the current user.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/supervisor/pending-verification": {
        "get": {
          "description": "This endpoint is for a supervisor to view the list of requests they need to verify.",
          "operationId": "DocumentRequestController_getRequestsToVerify",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved pending document requests for verification."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve document requests pending verification by the active user.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/my-verified": {
        "get": {
          "description": "Retrieves all document requests that the authenticated user has marked as verified.",
          "operationId": "DocumentRequestController_getVerifiedRequestsByMe",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved the list of verified document requests."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a list of document requests verified by the current user.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/my-approved": {
        "get": {
          "description": "Retrieves all document requests that the authenticated user has approved or rejected as a record office manager.",
          "operationId": "DocumentRequestController_getApprovedRequestsByMe",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved the list of approved/rejected document requests."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a list of document requests approved or rejected by the current user.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}/approve": {
        "patch": {
          "description": "Assigns multiple documents to a request. The request must be verified before it can be approved.",
          "operationId": "DocumentRequestController_approveRequest",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request to approve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApproveDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document request successfully approved and link generated."
            },
            "400": {
              "description": "Request already processed or invalid data."
            },
            "404": {
              "description": "Document request or associated document not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Approve a verified document request and generate a shared link.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}/approveDocumentRequestWithWaterMark": {
        "patch": {
          "description": "Approves a verified request and sets request-wide view/download permissions.",
          "operationId": "DocumentRequestController_approveDocumentRequestWithWaterMark",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the request.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApproveDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document request successfully approved."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Approve a verified document request and grant access.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}/reject": {
        "patch": {
          "operationId": "DocumentRequestController_rejectRequest",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request to reject.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RejectDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document request successfully rejected."
            },
            "400": {
              "description": "Request already processed."
            },
            "404": {
              "description": "Document request not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Reject a document request.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/shared/{token}/details": {
        "get": {
          "description": "This endpoint provides metadata about the shared document, but not the file content itself.",
          "operationId": "DocumentRequestController_getSharedDocumentMeta",
          "parameters": [
            {
              "name": "token",
              "required": true,
              "in": "path",
              "description": "The unique token for the shared document.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved shared document details."
            },
            "403": {
              "description": "Shared link is not active or has expired."
            },
            "404": {
              "description": "Invalid or expired shared link."
            }
          },
          "summary": "Get details of a shared document using a secure token.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{requestId}/document/{documentId}/file/{fileId}/view": {
        "get": {
          "description": "Requires 'canView' permission on the request. File is sent with 'inline' disposition.",
          "operationId": "DocumentRequestController_viewDocument",
          "parameters": [
            {
              "name": "requestId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "fileId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Watermarked document is streamed."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "View a specific approved file with a personalized watermark.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{requestId}/document/{documentId}/file/{fileId}/download": {
        "get": {
          "description": "Requires 'canDownload' permission on the request. File is sent with 'attachment' disposition.",
          "operationId": "DocumentRequestController_downloadDocument",
          "parameters": [
            {
              "name": "requestId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "fileId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Watermarked document is downloaded."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Download a specific approved file with a personalized watermark.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/shared/{token}/view/{filePath}": {
        "get": {
          "description": "Requires view permission via the shared link. Streams the file content directly.",
          "operationId": "DocumentRequestController_viewSharedDocumentFile",
          "parameters": [
            {
              "name": "token",
              "required": true,
              "in": "path",
              "description": "The unique token for the shared document.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "filePath",
              "required": true,
              "in": "path",
              "description": "The MinIO object path of the document file to view.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully streamed the document file.",
              "content": {
                "application/pdf": {},
                "image/jpeg": {},
                "image/png": {}
              }
            },
            "403": {
              "description": "Permission denied to view this document."
            },
            "404": {
              "description": "Invalid or expired shared link, or file not found."
            }
          },
          "summary": "View a shared document file (stream content).",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/shared/{token}/download/{filePath}": {
        "get": {
          "description": "Requires download permission via the shared link. Initiates a file download.",
          "operationId": "DocumentRequestController_downloadSharedDocumentFile",
          "parameters": [
            {
              "name": "token",
              "required": true,
              "in": "path",
              "description": "The unique token for the shared document.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "filePath",
              "required": true,
              "in": "path",
              "description": "The MinIO object path of the document file to download.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully downloaded the document file.",
              "content": {
                "application/octet-stream": {}
              }
            },
            "403": {
              "description": "Permission denied to download this document."
            },
            "404": {
              "description": "Invalid or expired shared link, or file not found."
            }
          },
          "summary": "Download a shared document file.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}": {
        "get": {
          "operationId": "DocumentRequestController_getById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the document request."
            },
            "404": {
              "description": "Document request not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a specific document request by ID.",
          "tags": [
            "Document Requests"
          ]
        },
        "patch": {
          "description": "Allows the creator of a document request to edit its topic or description, but only if the request is still pending.",
          "operationId": "DocumentRequestController_editRequest",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request to edit.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateDocumentRequestDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document request successfully updated."
            },
            "400": {
              "description": "Request is not in a PENDING state."
            },
            "403": {
              "description": "User not authorized to edit this request."
            },
            "404": {
              "description": "Document request not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Edit a document request.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/document-requests/{id}/soft-delete": {
        "patch": {
          "operationId": "DocumentRequestController_deleteRequest",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the document request to soft delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Document request successfully soft-deleted."
            },
            "403": {
              "description": "Forbidden to soft delete this document request."
            },
            "404": {
              "description": "Document request not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Soft delete a document request.",
          "tags": [
            "Document Requests"
          ]
        }
      },
      "/office-api/hierarchy/subordinates": {
        "get": {
          "operationId": "OrganizationalHierarchyController_getSubordinates",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get users below current user in hierarchy",
          "tags": [
            "Organizational Hierarchy"
          ]
        }
      },
      "/office-api/hierarchy/supervisor": {
        "get": {
          "operationId": "OrganizationalHierarchyController_getSupervisor",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisor."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get immediate supervisor of current user",
          "tags": [
            "Organizational Hierarchy"
          ]
        }
      },
      "/office-api/hierarchy/peers": {
        "get": {
          "operationId": "OrganizationalHierarchyController_getPeers",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved peers."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get peer users at same hierarchy level",
          "tags": [
            "Organizational Hierarchy"
          ]
        }
      },
      "/office-api/hierarchy/all-subordinates": {
        "get": {
          "operationId": "OrganizationalHierarchyController_getAllSubordinate",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved full subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get full subordinates",
          "tags": [
            "Organizational Hierarchy"
          ]
        }
      },
      "/office-api/hierarchy/all-supervisors": {
        "get": {
          "operationId": "OrganizationalHierarchyController_getAllSupervisors",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved all supervisors excluding record office."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all supervisors from bottom to top (excluding record office)",
          "tags": [
            "Organizational Hierarchy"
          ]
        }
      },
      "/office-api/letter-type": {
        "post": {
          "operationId": "LetterTypeController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLetterTypeDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Letter type created successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new letter type",
          "tags": [
            "Letter Type"
          ]
        },
        "get": {
          "operationId": "LetterTypeController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of all letter types retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all letter types",
          "tags": [
            "Letter Type"
          ]
        }
      },
      "/office-api/letter-type/{letterTypeId}": {
        "patch": {
          "operationId": "LetterTypeController_update",
          "parameters": [
            {
              "name": "letterTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter type to update",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLetterTypeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter type updated successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing letter type",
          "tags": [
            "Letter Type"
          ]
        },
        "delete": {
          "operationId": "LetterTypeController_remove",
          "parameters": [
            {
              "name": "letterTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter type to delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter type deleted successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a letter type",
          "tags": [
            "Letter Type"
          ]
        },
        "get": {
          "operationId": "LetterTypeController_findOne",
          "parameters": [
            {
              "name": "letterTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter type to retrieve",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter type retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a letter type by ID",
          "tags": [
            "Letter Type"
          ]
        }
      },
      "/office-api/letter-type/public": {
        "get": {
          "operationId": "LetterTypeController_getPublicLetterTypes",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of public letter types retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/LetterTypeResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all public letter types",
          "tags": [
            "Letter Type"
          ]
        }
      },
      "/office-api/letter-type/{typeName}": {
        "get": {
          "operationId": "LetterTypeController_findByNameParam",
          "parameters": [
            {
              "name": "typeName",
              "required": true,
              "in": "path",
              "description": "Name of the letter type to retrieve",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter type retrieved successfully by name"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a letter type by name",
          "tags": [
            "Letter Type"
          ]
        }
      },
      "/office-api/letter-template-type": {
        "post": {
          "operationId": "LetterTemplateTypeController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLetterTemplateTypeDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Letter template type created successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new letter template type",
          "tags": [
            "Letter Template Type"
          ]
        },
        "get": {
          "operationId": "LetterTemplateTypeController_findByName",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Search term to filter letter template types by name",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of letter template types retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all letter template types",
          "tags": [
            "Letter Template Type"
          ]
        }
      },
      "/office-api/letter-template-type/{LetterTemplateTypeId}": {
        "patch": {
          "operationId": "LetterTemplateTypeController_update",
          "parameters": [
            {
              "name": "LetterTemplateTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter template type to update",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLetterTemplateTypeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter template type updated successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing letter template type",
          "tags": [
            "Letter Template Type"
          ]
        },
        "delete": {
          "operationId": "LetterTemplateTypeController_remove",
          "parameters": [
            {
              "name": "LetterTemplateTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter template type to delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter template type deleted successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a letter template type",
          "tags": [
            "Letter Template Type"
          ]
        },
        "get": {
          "operationId": "LetterTemplateTypeController_findOne",
          "parameters": [
            {
              "name": "LetterTemplateTypeId",
              "required": true,
              "in": "path",
              "description": "ID of the letter template type to retrieve",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter template type retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a letter type by ID",
          "tags": [
            "Letter Template Type"
          ]
        }
      },
      "/office-api/letter-template-type/{templateTypeName}": {
        "get": {
          "operationId": "LetterTemplateTypeController_findByNameParam",
          "parameters": [
            {
              "name": "templateTypeName",
              "required": true,
              "in": "path",
              "description": "Name of the letter template type to retrieve",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter template type retrieved successfully by name"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a letter template type by name",
          "tags": [
            "Letter Template Type"
          ]
        }
      },
      "/office-api/letter-templates": {
        "post": {
          "operationId": "LetterTemplatesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLetterTemplateMultipartDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTemplateResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new letter template with an optional file attachment",
          "tags": [
            "letter-templates"
          ]
        },
        "get": {
          "operationId": "LetterTemplatesController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "templateName"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "q",
              "required": false,
              "in": "query",
              "description": "Search templateName, subject, body",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "letterTemplateTypeId",
              "required": false,
              "in": "query",
              "description": "Filter by template type id",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter by creator (user id)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Created at >= dateFrom (ISO)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Created at <= dateTo (ISO)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedLetterTemplateDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "List templates with filtering & pagination",
          "tags": [
            "letter-templates"
          ]
        }
      },
      "/office-api/letter-templates/download": {
        "get": {
          "operationId": "LetterTemplatesController_download",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "MinIO file path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File will be streamed as download"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Download a letter template file from MinIO",
          "tags": [
            "letter-templates"
          ]
        }
      },
      "/office-api/letter-templates/{id}": {
        "get": {
          "operationId": "LetterTemplatesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTemplateResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a single template by id",
          "tags": [
            "letter-templates"
          ]
        },
        "patch": {
          "operationId": "LetterTemplatesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLetterTemplateMultipartDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTemplateResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a template and optionally replace the file",
          "tags": [
            "letter-templates"
          ]
        },
        "delete": {
          "operationId": "LetterTemplatesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTemplateResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a template and its attached file",
          "tags": [
            "letter-templates"
          ]
        }
      },
      "/office-api/branding/view-image": {
        "get": {
          "operationId": "BrandingController_viewBrandingImage",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path (e.g., branding/1678881234-logo.png)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a presigned URL to view the image.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "url": "https://your-minio-domain.com/bucket/branding/1678881234-logo.png?X-Amz-Signature=..."
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "View a branding image from MinIO (presigned URL)",
          "tags": [
            "Branding"
          ]
        }
      },
      "/office-api/branding/view-image-stream": {
        "get": {
          "operationId": "BrandingController_viewBrandingImageStream",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path (e.g., branding/1678881234-logo.png)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Image streamed successfully."
            },
            "404": {
              "description": "Image not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream a branding image from MinIO through the backend",
          "tags": [
            "Branding"
          ]
        }
      },
      "/office-api/branding": {
        "post": {
          "operationId": "BrandingController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "logo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "footerLogo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "stampPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "headerPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "waterMarkPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "templatePath": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Upload branding assets (logo, footer logo, stamp, header)",
          "tags": [
            "Branding"
          ]
        },
        "get": {
          "operationId": "BrandingController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all branding records",
          "tags": [
            "Branding"
          ]
        }
      },
      "/office-api/branding/{id}": {
        "get": {
          "operationId": "BrandingController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get branding by ID",
          "tags": [
            "Branding"
          ]
        },
        "patch": {
          "operationId": "BrandingController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "logo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "footerLogo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "stampPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "headerPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "waterMarkPath": {
                      "type": "string",
                      "format": "binary"
                    },
                    "templatePath": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update branding (replace logo , footer logo , stamp , header )",
          "tags": [
            "Branding"
          ]
        },
        "delete": {
          "operationId": "BrandingController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The ID of the branding record to delete",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The branding record and associated files were successfully deleted."
            },
            "404": {
              "description": "Branding record not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a branding record and its files from MinIO",
          "tags": [
            "Branding"
          ]
        }
      },
      "/office-api/outgoing-letters": {
        "post": {
          "operationId": "OutgoingLettersController_create[0]",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING",
                        "INTERNAL"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "enclosure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "incomingLetterId": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string",
                      "description": "Comma-separated tags"
                    },
                    "to": {
                      "type": "string",
                      "description": "JSON string of recipients array"
                    },
                    "cc": {
                      "type": "string",
                      "description": "JSON string of CC recipients array"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "Single main letter file (PDF, DOCX, etc.)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Multiple attachment files"
                    }
                  },
                  "required": [
                    "type",
                    "body",
                    "priorityId",
                    "confidentialityId",
                    "languageId",
                    "to"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The outgoing letter has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input."
            },
            "404": {
              "description": "Not Found. One or more IDs do not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new outgoing letter with file uploads",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "get": {
          "operationId": "OutgoingLettersController_findAll[0]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of outgoing letters based on user hierarchy and query parameters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all outgoing letters accessible to the user with optional filtering, sorting, and pagination.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters": {
        "post": {
          "operationId": "OutgoingLettersController_create[1]",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING",
                        "INTERNAL"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "enclosure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "incomingLetterId": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string",
                      "description": "Comma-separated tags"
                    },
                    "to": {
                      "type": "string",
                      "description": "JSON string of recipients array"
                    },
                    "cc": {
                      "type": "string",
                      "description": "JSON string of CC recipients array"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "Single main letter file (PDF, DOCX, etc.)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Multiple attachment files"
                    }
                  },
                  "required": [
                    "type",
                    "body",
                    "priorityId",
                    "confidentialityId",
                    "languageId",
                    "to"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The outgoing letter has been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input."
            },
            "404": {
              "description": "Not Found. One or more IDs do not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new outgoing letter with file uploads",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "get": {
          "operationId": "OutgoingLettersController_findAll[1]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of outgoing letters based on user hierarchy and query parameters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all outgoing letters accessible to the user with optional filtering, sorting, and pagination.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/presigned-url": {
        "get": {
          "operationId": "OutgoingLettersController_getPresignedUrl[0]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The MinIO object path/name of the file (e.g., outgoing-letters/uuid/attachments/123-file.pdf).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully generated backend URL.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string",
                        "format": "url",
                        "description": "Backend URL"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "File not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Generates a backend stream URL to view a file.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/presigned-url": {
        "get": {
          "operationId": "OutgoingLettersController_getPresignedUrl[1]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The MinIO object path/name of the file (e.g., outgoing-letters/uuid/attachments/123-file.pdf).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully generated backend URL.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string",
                        "format": "url",
                        "description": "Backend URL"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "File not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Generates a backend stream URL to view a file.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/files/stream": {
        "get": {
          "operationId": "OutgoingLettersController_streamFile[0]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The MinIO object path/name of the file (e.g., outgoing-letters/uuid/main.pdf).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream an outgoing letter file through the backend",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/files/stream": {
        "get": {
          "operationId": "OutgoingLettersController_streamFile[1]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The MinIO object path/name of the file (e.g., outgoing-letters/uuid/main.pdf).",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream an outgoing letter file through the backend",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/re-distribute": {
        "post": {
          "description": "\n      Creates fresh, independent copies of an existing letter for new recipients.\n      Validation:\n      - The caller must exist in the original letter's tracking history (as sender or receiver).\n\n   \n    ",
          "operationId": "OutgoingLettersController_reDistribute[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the original letter to branch from",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReDistributeLetterDto"
                },
                "examples": {
                  "userOnly": {
                    "summary": "Example 1: Send to User Only",
                    "value": {
                      "toUserIds": [
                        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      ],
                      "comment": "Adding you to this workflow for your information.",
                      "suggestion": "Please review the attachments carefully."
                    }
                  },
                  "orgOnly": {
                    "summary": "Example 2: Send to Organization Only",
                    "value": {
                      "toOrganizationIds": [
                        "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                      ],
                      "comment": "Forwarding to your department for processing.",
                      "suggestion": "Assign a focal person for this case."
                    }
                  },
                  "mixed": {
                    "summary": "Example 3: Both (Mixed)",
                    "value": {
                      "toUserIds": [
                        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      ],
                      "toOrganizationIds": [
                        "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                      ],
                      "comment": "Collaborative review required between the department and the specialist.",
                      "suggestion": "Please reply by EOD Friday."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "New letter copies created and recipients notified."
            },
            "403": {
              "description": "Forbidden: User not found in letter history."
            },
            "404": {
              "description": "Not Found: Original letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Re-distribute (Copy & Send) a letter to new recipients",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/re-distribute": {
        "post": {
          "description": "\n      Creates fresh, independent copies of an existing letter for new recipients.\n      Validation:\n      - The caller must exist in the original letter's tracking history (as sender or receiver).\n\n   \n    ",
          "operationId": "OutgoingLettersController_reDistribute[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the original letter to branch from",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReDistributeLetterDto"
                },
                "examples": {
                  "userOnly": {
                    "summary": "Example 1: Send to User Only",
                    "value": {
                      "toUserIds": [
                        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      ],
                      "comment": "Adding you to this workflow for your information.",
                      "suggestion": "Please review the attachments carefully."
                    }
                  },
                  "orgOnly": {
                    "summary": "Example 2: Send to Organization Only",
                    "value": {
                      "toOrganizationIds": [
                        "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                      ],
                      "comment": "Forwarding to your department for processing.",
                      "suggestion": "Assign a focal person for this case."
                    }
                  },
                  "mixed": {
                    "summary": "Example 3: Both (Mixed)",
                    "value": {
                      "toUserIds": [
                        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      ],
                      "toOrganizationIds": [
                        "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                      ],
                      "comment": "Collaborative review required between the department and the specialist.",
                      "suggestion": "Please reply by EOD Friday."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "New letter copies created and recipients notified."
            },
            "403": {
              "description": "Forbidden: User not found in letter history."
            },
            "404": {
              "description": "Not Found: Original letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Re-distribute (Copy & Send) a letter to new recipients",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/to-me": {
        "get": {
          "operationId": "OutgoingLettersController_findLettersToUser[0]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of dispatched outgoing letters addressed TO the user, their organization, or source organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve DISPATCHED outgoing letters where user, their organization, or source organization is a TO recipient.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/to-me": {
        "get": {
          "operationId": "OutgoingLettersController_findLettersToUser[1]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of dispatched outgoing letters addressed TO the user, their organization, or source organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve DISPATCHED outgoing letters where user, their organization, or source organization is a TO recipient.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/cc-me": {
        "get": {
          "operationId": "OutgoingLettersController_findLettersCcUser[0]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of dispatched outgoing letters where user, their organization, or source organization is CC'd.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve DISPATCHED outgoing letters where user, their organization, or source organization is a CC recipient.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/cc-me": {
        "get": {
          "operationId": "OutgoingLettersController_findLettersCcUser[1]",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Global search term to filter by Subject, Internal Tracking Number, Reference Number, or Tags.",
              "schema": {
                "example": "Drafting meeting 101",
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter letters by subject (case-insensitive partial match).",
              "schema": {
                "example": "Meeting",
                "type": "string"
              }
            },
            {
              "name": "actionType",
              "required": false,
              "in": "query",
              "description": "Filter letters by a specific action type.",
              "schema": {
                "example": "FORWARDED",
                "type": "string",
                "enum": [
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "COMPLETED",
                  "CC_ADDED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "Filter letters by the ID of the user who created them.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter letters by status.",
              "schema": {
                "example": "DISPATCHED",
                "type": "string",
                "enum": [
                  "DRAFT",
                  "FORKED",
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "ARCHIVED",
                  "ESCALATED",
                  "FORWARDED",
                  "CREATED",
                  "PRINTED",
                  "DISPATCHED",
                  "DELIVERED",
                  "RETURNED",
                  "CANCELLED",
                  "SIGNED",
                  "RECEIVED",
                  "UPLOADED",
                  "DELETED",
                  "EXPIRED",
                  "IN_PROGRESS",
                  "EDITED",
                  "RECALLED",
                  "Transferred",
                  "COMPLETED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "The field to sort by.",
              "schema": {
                "example": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "subject",
                  "sentDate"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "The order to sort by (ASC or DESC).",
              "schema": {
                "default": "asc",
                "example": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number for pagination.",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page.",
              "schema": {
                "default": 10,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter letters by type (e.g., MEMO, OUTGOING).",
              "schema": {
                "example": "OUTGOING",
                "type": "string",
                "enum": [
                  "MEMO",
                  "OUTGOING",
                  "INTERNAL"
                ]
              }
            },
            {
              "name": "recipientType",
              "required": false,
              "in": "query",
              "description": "Filter letters by formal recipient type (TO or CC).",
              "schema": {
                "example": "CC",
                "type": "string",
                "enum": [
                  "TO",
                  "CC"
                ]
              }
            },
            {
              "name": "isMyOutgoingFlow",
              "required": false,
              "in": "query",
              "description": "If true, filters all letters where the current login user was the creator OR the actor (sender) of a workflow action (My Outgoing Flow).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isAddressedToMe",
              "required": false,
              "in": "query",
              "description": "If true, filters only letters currently addressed or routed to the current login user for action (My Incoming/Actionable).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "toRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal TO recipient (often redundant if recipientType=TO is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "ccRecipientOnly",
              "required": false,
              "in": "query",
              "description": "Filter only letters where user/org is a formal CC recipient (often redundant if recipientType=CC is used).",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "organization id to filter letters by organization.",
              "schema": {
                "example": "1234-234-56789",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of dispatched outgoing letters where user, their organization, or source organization is CC'd.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve DISPATCHED outgoing letters where user, their organization, or source organization is a CC recipient.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/user/unseen-outgoing-letters-count": {
        "get": {
          "operationId": "OutgoingLettersController_getUnseenOutgoingLettersCount[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen outgoing letters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "count": {
                        "type": "number",
                        "example": 5
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen outgoing letters for the user",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/user/unseen-outgoing-letters-count": {
        "get": {
          "operationId": "OutgoingLettersController_getUnseenOutgoingLettersCount[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen outgoing letters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "count": {
                        "type": "number",
                        "example": 5
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen outgoing letters for the user",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/user/unseen-memo-letters-count": {
        "get": {
          "operationId": "OutgoingLettersController_getUnseenMemoLettersCount[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen memo letters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "count": {
                        "type": "number",
                        "example": 3
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen memo letters for the user",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/user/unseen-memo-letters-count": {
        "get": {
          "operationId": "OutgoingLettersController_getUnseenMemoLettersCount[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen memo letters.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "count": {
                        "type": "number",
                        "example": 3
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen memo letters for the user",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/type": {
        "get": {
          "description": "This endpoint is highly optimized to fetch only the letter type for quick checks without loading the full letter data.",
          "operationId": "OutgoingLettersController_getLetterType[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The type of the outgoing letter.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTypeResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Outgoing letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve the specific type (MEMO or OUTGOING) of a letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/type": {
        "get": {
          "description": "This endpoint is highly optimized to fetch only the letter type for quick checks without loading the full letter data.",
          "operationId": "OutgoingLettersController_getLetterType[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The type of the outgoing letter.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterTypeResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Outgoing letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve the specific type (MEMO or OUTGOING) of a letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/versions": {
        "get": {
          "description": "Retrieve the complete version history of a letter, showing all edits made over time.",
          "operationId": "OutgoingLettersController_getLetterVersions[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of all versions of the letter, ordered from newest to oldest.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterVersionResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all versions of a letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/versions": {
        "get": {
          "description": "Retrieve the complete version history of a letter, showing all edits made over time.",
          "operationId": "OutgoingLettersController_getLetterVersions[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A list of all versions of the letter, ordered from newest to oldest.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/OutgoingLetterVersionResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all versions of a letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/version/{versionId}": {
        "get": {
          "operationId": "OutgoingLettersController_getVersion[0]",
          "parameters": [
            {
              "name": "versionId",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter version",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The requested outgoing letter version.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/"
                  }
                }
              }
            },
            "404": {
              "description": "Letter version not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a specific version of an outgoing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/version/{versionId}": {
        "get": {
          "operationId": "OutgoingLettersController_getVersion[1]",
          "parameters": [
            {
              "name": "versionId",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter version",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The requested outgoing letter version.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/"
                  }
                }
              }
            },
            "404": {
              "description": "Letter version not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a specific version of an outgoing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}": {
        "get": {
          "operationId": "OutgoingLettersController_findOne[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The outgoing letter found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Outgoing letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an outgoing letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "patch": {
          "operationId": "OutgoingLettersController_update[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "cc": {
                      "type": "string"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "Single main letter file (replaces existing)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Multiple attachment files (adds to existing)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input."
            },
            "404": {
              "description": "Not Found. The letter or one of the provided IDs does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an outgoing letter by ID with optional file uploads",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "delete": {
          "description": "\n    Permanently delete an outgoing letter. This action is only allowed if:\n    1. The user is the creator of the letter\n    2. No actions have been taken on the letter except the initial creation\n    This is a hard delete operation and cannot be undone.\n  ",
          "operationId": "OutgoingLettersController_deleteLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The letter has been successfully deleted.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string",
                        "example": "Letter successfully deleted."
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Either you are not the creator or actions have been taken on the letter.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "Cannot delete this letter. Actions have been taken on it beyond creation.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter does not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Outgoing letter with ID {id} not found.",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an outgoing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}": {
        "get": {
          "operationId": "OutgoingLettersController_findOne[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The outgoing letter found by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Outgoing letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an outgoing letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "patch": {
          "operationId": "OutgoingLettersController_update[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "cc": {
                      "type": "string"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "Single main letter file (replaces existing)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Multiple attachment files (adds to existing)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input."
            },
            "404": {
              "description": "Not Found. The letter or one of the provided IDs does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an outgoing letter by ID with optional file uploads",
          "tags": [
            "Outgoing Letters"
          ]
        },
        "delete": {
          "description": "\n    Permanently delete an outgoing letter. This action is only allowed if:\n    1. The user is the creator of the letter\n    2. No actions have been taken on the letter except the initial creation\n    This is a hard delete operation and cannot be undone.\n  ",
          "operationId": "OutgoingLettersController_deleteLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The letter has been successfully deleted.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string",
                        "example": "Letter successfully deleted."
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Either you are not the creator or actions have been taken on the letter.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "Cannot delete this letter. Actions have been taken on it beyond creation.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter does not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Outgoing letter with ID {id} not found.",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an outgoing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/soft-delete": {
        "patch": {
          "operationId": "OutgoingLettersController_softDelete[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to soft-delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The letter has been successfully soft-deleted.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Soft-delete an outgoing letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/soft-delete": {
        "patch": {
          "operationId": "OutgoingLettersController_softDelete[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to soft-delete",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The letter has been successfully soft-deleted.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Soft-delete an outgoing letter by ID",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/forward-to-record-office": {
        "patch": {
          "operationId": "OutgoingLettersController_forwardToRecordOffice[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToRecordOfficeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully forwarded to the record office.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks permission."
            },
            "404": {
              "description": "Not Found. Letter or record office not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward an outgoing letter to the record office",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/forward-to-record-office": {
        "patch": {
          "operationId": "OutgoingLettersController_forwardToRecordOffice[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToRecordOfficeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully forwarded to the record office.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks permission."
            },
            "404": {
              "description": "Not Found. Letter or record office not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward an outgoing letter to the record office",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/forward": {
        "patch": {
          "operationId": "OutgoingLettersController_forward[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOutgoingOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully forwarded.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks permission or forward is invalid."
            },
            "404": {
              "description": "Not Found. Letter or organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward an outgoing letter to a child organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/forward": {
        "patch": {
          "operationId": "OutgoingLettersController_forward[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOutgoingOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully forwarded.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks permission or forward is invalid."
            },
            "404": {
              "description": "Not Found. Letter or organization not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward an outgoing letter to a child organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/edit": {
        "patch": {
          "description": "This endpoint allows editing a letter before it is dispatched. All changes are tracked and the previous version is saved.",
          "operationId": "OutgoingLettersController_editLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING",
                        "INTERNAL"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "enclosure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string",
                      "description": "JSON string of recipients"
                    },
                    "cc": {
                      "type": "string",
                      "description": "JSON string of CC recipients"
                    },
                    "editReason": {
                      "type": "string",
                      "description": "Reason for editing"
                    },
                    "removeAttachments": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "File paths to remove (one path per item)"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "New main letter file (replaces existing)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "New attachment files to add"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully edited. Previous version saved.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Cannot edit a dispatched letter."
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Edit an outgoing letter and create a version history",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/edit": {
        "patch": {
          "description": "This endpoint allows editing a letter before it is dispatched. All changes are tracked and the previous version is saved.",
          "operationId": "OutgoingLettersController_editLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "MEMO",
                        "OUTGOING",
                        "INTERNAL"
                      ]
                    },
                    "subject": {
                      "type": "string"
                    },
                    "body": {
                      "type": "string"
                    },
                    "closure": {
                      "type": "string"
                    },
                    "enclosure": {
                      "type": "string"
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "serviceType": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string",
                      "description": "JSON string of recipients"
                    },
                    "cc": {
                      "type": "string",
                      "description": "JSON string of CC recipients"
                    },
                    "editReason": {
                      "type": "string",
                      "description": "Reason for editing"
                    },
                    "removeAttachments": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "File paths to remove (one path per item)"
                    },
                    "outgoingFile": {
                      "type": "string",
                      "format": "binary",
                      "description": "New main letter file (replaces existing)"
                    },
                    "attachmentFiles": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "New attachment files to add"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully edited. Previous version saved.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Cannot edit a dispatched letter."
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Edit an outgoing letter and create a version history",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/forward-memo": {
        "patch": {
          "description": "\n    This endpoint allows forwarding a MEMO type letter to one or more users and/or organizations.\n\n    Key Features:-\n    - Forward to multiple users simultaneously\n    - Forward to multiple organizations simultaneously\n    - Forward to a mix of users and organizations\n    - All recipients must be within the organizational hierarchy\n    Authorization:-\n    - User must be the current assignee OR in the same organization as the current assignee\n    - Requires 'forward-memo-letter' permission\n    Validations:-\n    - Letter must be of type MEMO\n    - Letter must not be dispatched\n    - At least one recipient (user or organization) must be specified\n    - All user/organization IDs must exist\n\n    Notifications:-\n    - All recipient users receive notifications\n    - Organization heads receive notifications when forwarding to organizations\n  ",
          "operationId": "OutgoingLettersController_forwardMemo[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter (must be of type MEMO)",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Forward memo details including recipient users and organizations",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardMemoDto"
                },
                "examples": {
                  "usersOnly": {
                    "summary": "Forward to users only",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000",
                        "123e4567-e89b-12d3-a456-426614174001"
                      ],
                      "comment": "Please review and provide feedback",
                      "suggestion": "Please respond within 48 hours"
                    }
                  },
                  "organizationsOnly": {
                    "summary": "Forward to organizations only",
                    "value": {
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002"
                      ],
                      "comment": "For your department's review",
                      "suggestion": "Please respond within 48 hours"
                    }
                  },
                  "mixedRecipients": {
                    "summary": "Forward to both users and organizations (Comprehensive Example)",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000"
                      ],
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002",
                        "123e4567-e89b-12d3-a456-426614174003"
                      ],
                      "comment": "Urgent review required by both the user and the organizations.",
                      "suggestion": "Please prioritize this memo over all others."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The memo has been successfully forwarded to all specified recipients. Tracking records created and notifications sent.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ForwardMemoResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Possible reasons: No recipients specified, invalid UUID format, or validation failed.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "At least one user or organization must be specified for forwarding. Please provide either toUserIds or toOrganizationIds.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Possible reasons: User lacks permission, letter is not MEMO type, letter is dispatched, or recipients outside organizational hierarchy.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "Only MEMO type letters can be forwarded using this endpoint. This letter is of type OUTGOING.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter, one or more user IDs, or one or more organization IDs do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "The following user IDs were not found: 123e4567-e89b-12d3-a456-426614174999",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward a memo-type letter to multiple users and/or organizations",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/forward-memo": {
        "patch": {
          "description": "\n    This endpoint allows forwarding a MEMO type letter to one or more users and/or organizations.\n\n    Key Features:-\n    - Forward to multiple users simultaneously\n    - Forward to multiple organizations simultaneously\n    - Forward to a mix of users and organizations\n    - All recipients must be within the organizational hierarchy\n    Authorization:-\n    - User must be the current assignee OR in the same organization as the current assignee\n    - Requires 'forward-memo-letter' permission\n    Validations:-\n    - Letter must be of type MEMO\n    - Letter must not be dispatched\n    - At least one recipient (user or organization) must be specified\n    - All user/organization IDs must exist\n\n    Notifications:-\n    - All recipient users receive notifications\n    - Organization heads receive notifications when forwarding to organizations\n  ",
          "operationId": "OutgoingLettersController_forwardMemo[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter (must be of type MEMO)",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Forward memo details including recipient users and organizations",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardMemoDto"
                },
                "examples": {
                  "usersOnly": {
                    "summary": "Forward to users only",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000",
                        "123e4567-e89b-12d3-a456-426614174001"
                      ],
                      "comment": "Please review and provide feedback",
                      "suggestion": "Please respond within 48 hours"
                    }
                  },
                  "organizationsOnly": {
                    "summary": "Forward to organizations only",
                    "value": {
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002"
                      ],
                      "comment": "For your department's review",
                      "suggestion": "Please respond within 48 hours"
                    }
                  },
                  "mixedRecipients": {
                    "summary": "Forward to both users and organizations (Comprehensive Example)",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000"
                      ],
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002",
                        "123e4567-e89b-12d3-a456-426614174003"
                      ],
                      "comment": "Urgent review required by both the user and the organizations.",
                      "suggestion": "Please prioritize this memo over all others."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The memo has been successfully forwarded to all specified recipients. Tracking records created and notifications sent.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ForwardMemoResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Possible reasons: No recipients specified, invalid UUID format, or validation failed.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "At least one user or organization must be specified for forwarding. Please provide either toUserIds or toOrganizationIds.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Possible reasons: User lacks permission, letter is not MEMO type, letter is dispatched, or recipients outside organizational hierarchy.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "Only MEMO type letters can be forwarded using this endpoint. This letter is of type OUTGOING.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter, one or more user IDs, or one or more organization IDs do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "The following user IDs were not found: 123e4567-e89b-12d3-a456-426614174999",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward a memo-type letter to multiple users and/or organizations",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/transfer-multiple": {
        "patch": {
          "description": "\n    This endpoint allows forking/transferring a MEMO type letter to one or more recipients. \n    Each recipient will receive a new independent copy of the letter with its own tracking history.\n\n    Key Features:\n    - Creates \"forked\" copies for each recipient\n    - Recipients can be individual users, organizations, or a mix\n    - **Retains the original Internal Tracking Number** for case consistency\n    - Identifies the 'Formal Sender' based on the last action taken in the tracking history\n    \n    Authorization:\n    - User must be the current assignee or an authorized actor in the workflow\n  ",
          "operationId": "OutgoingLettersController_transferMultiple[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the original outgoing letter to be transferred",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Transfer details including recipient IDs, comments, and suggestions",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransferMemoDto"
                },
                "examples": {
                  "usersOnly": {
                    "summary": "Transfer to specific users",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000"
                      ],
                      "comment": "Transferring for your department to handle.",
                      "suggestion": "Please process according to standard procedure."
                    }
                  },
                  "organizationsOnly": {
                    "summary": "Transfer to organizations",
                    "value": {
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002"
                      ],
                      "comment": "Official transfer to the Finance Department."
                    }
                  },
                  "mixedTransfer": {
                    "summary": "Transfer to both users and organizations",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174001"
                      ],
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174005"
                      ],
                      "comment": "Bulk transfer for cross-departmental action.",
                      "suggestion": "Ensure all copies are synced in the final report."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The memo has been successfully transferred. Individual copies created and notifications sent.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TransferMemoResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. No recipients specified or invalid UUID format.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "At least one user or organization must be specified for transferring.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User is not authorized to transfer this specific letter."
            },
            "404": {
              "description": "Not Found. The original letter or specified recipients do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Memo 123e4567-e89b-12d3-a456-426614174003 not found",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer a memo to multiple users and/or organizations",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/transfer-multiple": {
        "patch": {
          "description": "\n    This endpoint allows forking/transferring a MEMO type letter to one or more recipients. \n    Each recipient will receive a new independent copy of the letter with its own tracking history.\n\n    Key Features:\n    - Creates \"forked\" copies for each recipient\n    - Recipients can be individual users, organizations, or a mix\n    - **Retains the original Internal Tracking Number** for case consistency\n    - Identifies the 'Formal Sender' based on the last action taken in the tracking history\n    \n    Authorization:\n    - User must be the current assignee or an authorized actor in the workflow\n  ",
          "operationId": "OutgoingLettersController_transferMultiple[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the original outgoing letter to be transferred",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Transfer details including recipient IDs, comments, and suggestions",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransferMemoDto"
                },
                "examples": {
                  "usersOnly": {
                    "summary": "Transfer to specific users",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174000"
                      ],
                      "comment": "Transferring for your department to handle.",
                      "suggestion": "Please process according to standard procedure."
                    }
                  },
                  "organizationsOnly": {
                    "summary": "Transfer to organizations",
                    "value": {
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174002"
                      ],
                      "comment": "Official transfer to the Finance Department."
                    }
                  },
                  "mixedTransfer": {
                    "summary": "Transfer to both users and organizations",
                    "value": {
                      "toUserIds": [
                        "123e4567-e89b-12d3-a456-426614174001"
                      ],
                      "toOrganizationIds": [
                        "123e4567-e89b-12d3-a456-426614174005"
                      ],
                      "comment": "Bulk transfer for cross-departmental action.",
                      "suggestion": "Ensure all copies are synced in the final report."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The memo has been successfully transferred. Individual copies created and notifications sent.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TransferMemoResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. No recipients specified or invalid UUID format.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "At least one user or organization must be specified for transferring.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User is not authorized to transfer this specific letter."
            },
            "404": {
              "description": "Not Found. The original letter or specified recipients do not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Memo 123e4567-e89b-12d3-a456-426614174003 not found",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer a memo to multiple users and/or organizations",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/recall": {
        "patch": {
          "description": "Allows the letter creator to recall a letter that has been forwarded or escalated but not yet acted upon by the recipient.",
          "operationId": "OutgoingLettersController_recallLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RecallOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully recalled and returned to previous state.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Only creator can recall or letter has been acted upon."
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Recall a forwarded/escalated/return letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/recall": {
        "patch": {
          "description": "Allows the letter creator to recall a letter that has been forwarded or escalated but not yet acted upon by the recipient.",
          "operationId": "OutgoingLettersController_recallLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RecallOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully recalled and returned to previous state.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. Only creator can recall or letter has been acted upon."
            },
            "404": {
              "description": "Not Found. The letter does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Recall a forwarded/escalated/return letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/escalate/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_escalateToOrganization[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully escalated to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/escalate/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_escalateToOrganization[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully escalated to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/escalate/user": {
        "patch": {
          "description": "Assigns the outgoing letter to a designated user  by their User ID, updating the letter status and tracking history. The current user must have the \"canEscalateOutgoing\" permission.",
          "operationId": "OutgoingLettersController_escalateToUser[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully escalated and reassigned to the specified user.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. E.g., The target user is invalid or missing required data."
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions or is not authorized to escalate this letter."
            },
            "404": {
              "description": "Not Found. The letter or the target user does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate an outgoing letter to a specific user.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/escalate/user": {
        "patch": {
          "description": "Assigns the outgoing letter to a designated user  by their User ID, updating the letter status and tracking history. The current user must have the \"canEscalateOutgoing\" permission.",
          "operationId": "OutgoingLettersController_escalateToUser[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully escalated and reassigned to the specified user.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. E.g., The target user is invalid or missing required data."
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions or is not authorized to escalate this letter."
            },
            "404": {
              "description": "Not Found. The letter or the target user does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate an outgoing letter to a specific user.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/transfer": {
        "patch": {
          "description": "\n    This endpoint allows transferring an outgoing letter from one organization/user to another organization OR a specific user.\n\n    Key Features:\n    - Transfer letters to any active organization within the system OR a specific user.\n    - Automatic assignment to the target organization's head if 'toOrganizationId' is used.\n    - Direct assignment to the target user if 'toUserId' is used.\n    - Tracking history is maintained and notifications are sent.\n\n    Authorization Requirements:\n    - User must have 'canTransferOutgoing' permission.\n    - User must be EITHER the current assignee OR a member of the current assigned organization.\n    - Letter must NOT be in DISPATCHED status.\n\n    Validation Rules:\n    - Must specify **exactly one** transfer target: 'toOrganizationId' OR 'toUserId'.\n  ",
          "operationId": "OutgoingLettersController_transferToOrganization[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to transfer",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Transfer details including target organization/user and optional comments",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransferOutgoingLetterDto"
                },
                "examples": {
                  "basicTransferOrg": {
                    "summary": "Transfer to Organization (Assigns to Org Head)",
                    "value": {
                      "toOrganizationId": "123e4567-e89b-12d3-a456-426614174002",
                      "comment": "Transferring to the Legal Department for final approval.",
                      "suggestion": "Please sign this immediately and forward."
                    }
                  },
                  "basicTransferUser": {
                    "summary": "Transfer to Specific User (Assigns directly)",
                    "value": {
                      "toUserId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                      "comment": "Transferring to the Legal Department for final approval.",
                      "suggestion": "Please sign this immediately and forward."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully transferred to the target user or organization. A tracking record has been created and a notification has been sent.",
              "schema": {
                "example": {
                  "outgoingLetterId": "123e4567-e89b-12d3-a456-426614174003",
                  "type": "OUTGOING",
                  "subject": "Budget Approval Request",
                  "status": "Transferred",
                  "currentAssigneeId": "target-user-or-org-head-uuid",
                  "currentAssigneeOrganizationId": "target-organization-uuid",
                  "tracking": [
                    {
                      "letterTrackingId": "tracking-record-uuid",
                      "action": "TRANSFERRED",
                      "actionDate": "2025-01-15T10:30:00Z",
                      "notes": "Transfer successful.",
                      "isActionTaken": false,
                      "toUser": {
                        "userId": "target-user-or-org-head-uuid",
                        "fullName": "Jane Smith"
                      },
                      "toOrganization": {
                        "organizationId": "target-organization-uuid",
                        "organizationName": "Legal Department"
                      }
                    }
                  ]
                }
              },
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input or business rule violation. This can occur when: ambiguous/missing target, transfer to same organization/user, inactive organization, or letter not assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "ambiguousTarget": {
                        "summary": "Both User and Org Target Provided",
                        "value": {
                          "statusCode": 400,
                          "message": "The request must specify exactly one transfer target: either \"toOrganizationId\" or \"toUserId\", but not both.",
                          "error": "Bad Request"
                        }
                      },
                      "missingTarget": {
                        "summary": "Neither User nor Org Target Provided",
                        "value": {
                          "statusCode": 400,
                          "message": "The request must specify exactly one transfer target: either \"toOrganizationId\" or \"toUserId\", but not both.",
                          "error": "Bad Request"
                        }
                      },
                      "sameOrganization": {
                        "summary": "Transfer to same organization",
                        "value": {
                          "statusCode": 400,
                          "message": "Cannot transfer letter to the same organization it is currently assigned to. Please select a different target organization.",
                          "error": "Bad Request"
                        }
                      },
                      "sameUser": {
                        "summary": "Transfer to same user",
                        "value": {
                          "statusCode": 400,
                          "message": "Cannot transfer letter to the same user it is currently assigned to. Please select a different target user.",
                          "error": "Bad Request"
                        }
                      },
                      "userNotAssignedToOrg": {
                        "summary": "Target user not assigned to an organization",
                        "value": {
                          "statusCode": 400,
                          "message": "Target user \"John Doe\" is not part of an organization. Letters can only be assigned to users with an active organization position.",
                          "error": "Bad Request"
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. The user lacks the required permissions, is not authorized to transfer this specific letter, or the letter is DISPATCHED.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "unauthorized": {
                        "summary": "User not authorized",
                        "value": {
                          "statusCode": 403,
                          "message": "You are not authorized to transfer this letter. You must be the current assignee or belong to the current assigned organization.",
                          "error": "Forbidden"
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter, target organization/user, or organization head was not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "noOrganizationHead": {
                        "summary": "Organization has no head",
                        "value": {
                          "statusCode": 404,
                          "message": "Target organization \"Legal Department\" does not have an organization head assigned. Please ensure the organization has a designated head before transferring letters.",
                          "error": "Not Found"
                        }
                      },
                      "targetUserNotFound": {
                        "summary": "Target User Not Found",
                        "value": {
                          "statusCode": 404,
                          "message": "Target user with ID fedcba09-8765-4321-feba-dcba09876543 not found.",
                          "error": "Not Found"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer an outgoing letter to another user or organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/transfer": {
        "patch": {
          "description": "\n    This endpoint allows transferring an outgoing letter from one organization/user to another organization OR a specific user.\n\n    Key Features:\n    - Transfer letters to any active organization within the system OR a specific user.\n    - Automatic assignment to the target organization's head if 'toOrganizationId' is used.\n    - Direct assignment to the target user if 'toUserId' is used.\n    - Tracking history is maintained and notifications are sent.\n\n    Authorization Requirements:\n    - User must have 'canTransferOutgoing' permission.\n    - User must be EITHER the current assignee OR a member of the current assigned organization.\n    - Letter must NOT be in DISPATCHED status.\n\n    Validation Rules:\n    - Must specify **exactly one** transfer target: 'toOrganizationId' OR 'toUserId'.\n  ",
          "operationId": "OutgoingLettersController_transferToOrganization[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to transfer",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174003",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Transfer details including target organization/user and optional comments",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransferOutgoingLetterDto"
                },
                "examples": {
                  "basicTransferOrg": {
                    "summary": "Transfer to Organization (Assigns to Org Head)",
                    "value": {
                      "toOrganizationId": "123e4567-e89b-12d3-a456-426614174002",
                      "comment": "Transferring to the Legal Department for final approval.",
                      "suggestion": "Please sign this immediately and forward."
                    }
                  },
                  "basicTransferUser": {
                    "summary": "Transfer to Specific User (Assigns directly)",
                    "value": {
                      "toUserId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                      "comment": "Transferring to the Legal Department for final approval.",
                      "suggestion": "Please sign this immediately and forward."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully transferred to the target user or organization. A tracking record has been created and a notification has been sent.",
              "schema": {
                "example": {
                  "outgoingLetterId": "123e4567-e89b-12d3-a456-426614174003",
                  "type": "OUTGOING",
                  "subject": "Budget Approval Request",
                  "status": "Transferred",
                  "currentAssigneeId": "target-user-or-org-head-uuid",
                  "currentAssigneeOrganizationId": "target-organization-uuid",
                  "tracking": [
                    {
                      "letterTrackingId": "tracking-record-uuid",
                      "action": "TRANSFERRED",
                      "actionDate": "2025-01-15T10:30:00Z",
                      "notes": "Transfer successful.",
                      "isActionTaken": false,
                      "toUser": {
                        "userId": "target-user-or-org-head-uuid",
                        "fullName": "Jane Smith"
                      },
                      "toOrganization": {
                        "organizationId": "target-organization-uuid",
                        "organizationName": "Legal Department"
                      }
                    }
                  ]
                }
              },
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. Invalid input or business rule violation. This can occur when: ambiguous/missing target, transfer to same organization/user, inactive organization, or letter not assigned.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "ambiguousTarget": {
                        "summary": "Both User and Org Target Provided",
                        "value": {
                          "statusCode": 400,
                          "message": "The request must specify exactly one transfer target: either \"toOrganizationId\" or \"toUserId\", but not both.",
                          "error": "Bad Request"
                        }
                      },
                      "missingTarget": {
                        "summary": "Neither User nor Org Target Provided",
                        "value": {
                          "statusCode": 400,
                          "message": "The request must specify exactly one transfer target: either \"toOrganizationId\" or \"toUserId\", but not both.",
                          "error": "Bad Request"
                        }
                      },
                      "sameOrganization": {
                        "summary": "Transfer to same organization",
                        "value": {
                          "statusCode": 400,
                          "message": "Cannot transfer letter to the same organization it is currently assigned to. Please select a different target organization.",
                          "error": "Bad Request"
                        }
                      },
                      "sameUser": {
                        "summary": "Transfer to same user",
                        "value": {
                          "statusCode": 400,
                          "message": "Cannot transfer letter to the same user it is currently assigned to. Please select a different target user.",
                          "error": "Bad Request"
                        }
                      },
                      "userNotAssignedToOrg": {
                        "summary": "Target user not assigned to an organization",
                        "value": {
                          "statusCode": 400,
                          "message": "Target user \"John Doe\" is not part of an organization. Letters can only be assigned to users with an active organization position.",
                          "error": "Bad Request"
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. The user lacks the required permissions, is not authorized to transfer this specific letter, or the letter is DISPATCHED.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "unauthorized": {
                        "summary": "User not authorized",
                        "value": {
                          "statusCode": 403,
                          "message": "You are not authorized to transfer this letter. You must be the current assignee or belong to the current assigned organization.",
                          "error": "Forbidden"
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter, target organization/user, or organization head was not found.",
              "content": {
                "application/json": {
                  "schema": {
                    "examples": {
                      "noOrganizationHead": {
                        "summary": "Organization has no head",
                        "value": {
                          "statusCode": 404,
                          "message": "Target organization \"Legal Department\" does not have an organization head assigned. Please ensure the organization has a designated head before transferring letters.",
                          "error": "Not Found"
                        }
                      },
                      "targetUserNotFound": {
                        "summary": "Target User Not Found",
                        "value": {
                          "statusCode": 404,
                          "message": "Target user with ID fedcba09-8765-4321-feba-dcba09876543 not found.",
                          "error": "Not Found"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer an outgoing letter to another user or organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/complete": {
        "patch": {
          "description": "Sets the letter status to COMPLETED, sets isArchived to true, and records the action in the letter tracking.\n      This action effectively closes the letter lifecycle. It requires the user to have the necessary permissions.",
          "operationId": "OutgoingLettersController_completeLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to complete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": false,
            "description": "Optional reason for completing the letter.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CompleteOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully marked as COMPLETED.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. The letter is already completed.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "Letter {id} is already marked as completed.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permission or authorization.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "You are not authorized to mark this letter as completed.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter ID does not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Outgoing letter with ID {id} not found.",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Mark an outgoing letter as COMPLETED and ARCHIVED.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/complete": {
        "patch": {
          "description": "Sets the letter status to COMPLETED, sets isArchived to true, and records the action in the letter tracking.\n      This action effectively closes the letter lifecycle. It requires the user to have the necessary permissions.",
          "operationId": "OutgoingLettersController_completeLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter to complete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": false,
            "description": "Optional reason for completing the letter.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CompleteOutgoingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The letter has been successfully marked as COMPLETED.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request. The letter is already completed.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 400,
                      "message": "Letter {id} is already marked as completed.",
                      "error": "Bad Request"
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permission or authorization.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 403,
                      "message": "You are not authorized to mark this letter as completed.",
                      "error": "Forbidden"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found. The letter ID does not exist.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 404,
                      "message": "Outgoing letter with ID {id} not found.",
                      "error": "Not Found"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Mark an outgoing letter as COMPLETED and ARCHIVED.",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/return/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_returnToOrganization[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReturnOutgoingToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully returned to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Return an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/return/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_returnToOrganization[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReturnOutgoingToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully returned to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Return an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/dispatch/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_dispatchToOrganization[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DispatchOutgoingToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully dispatched to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Dispatching an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/dispatch/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_dispatchToOrganization[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DispatchOutgoingToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The outgoing letter has been successfully dispatched to the organization.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Dispatching an outgoing letter to an organization",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getLetters/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getGeneratedOutgoingLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getLetters/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getGeneratedOutgoingLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getLetter/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_singleLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getLetter/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_singleLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getLetterWithoutStamp/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getLetterWithoutStamp[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getLetterWithoutStamp/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getLetterWithoutStamp[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getLetterPreviews/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getOutgoingLetterPreview[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters preview as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getLetterPreviews/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getOutgoingLetterPreview[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters preview as one file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/add-cc": {
        "patch": {
          "operationId": "OutgoingLettersController_addCc[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddCcRecipientsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Add additional CC recipients to an existing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/add-cc": {
        "patch": {
          "operationId": "OutgoingLettersController_addCc[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the outgoing letter",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddCcRecipientsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Add additional CC recipients to an existing letter",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getMemoPreview": {
        "patch": {
          "operationId": "OutgoingLettersController_getOutgoingLetterPreviewForMemo[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a MEMO preview as one PDF file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getMemoPreview": {
        "patch": {
          "operationId": "OutgoingLettersController_getOutgoingLetterPreviewForMemo[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a MEMO preview as one PDF file",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{id}/getSingleReciepentOutgoingLetterPreview/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getSingleReciepentOutgoingLetterPreview[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters preview for one recipient",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{id}/getSingleReciepentOutgoingLetterPreview/organization": {
        "patch": {
          "operationId": "OutgoingLettersController_getSingleReciepentOutgoingLetterPreview[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully provided.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden. User lacks the required permissions."
            },
            "404": {
              "description": "Not Found. The letter or organization does not exist."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get an outgoing letters preview for one recipient",
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/outgoing-letters/{qr_id}/checkQR": {
        "get": {
          "operationId": "OutgoingLettersController_getQRLetter[0]",
          "parameters": [
            {
              "name": "qr_id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/api/outgoing-letters/{qr_id}/checkQR": {
        "get": {
          "operationId": "OutgoingLettersController_getQRLetter[1]",
          "parameters": [
            {
              "name": "qr_id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Outgoing Letters"
          ]
        }
      },
      "/office-api/sender-categories": {
        "post": {
          "operationId": "SenderCategoryController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSenderCategoryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The sender category has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new sender category",
          "tags": [
            "Sender Categories"
          ]
        },
        "get": {
          "operationId": "SenderCategoryController_findAll",
          "parameters": [
            {
              "name": "senderCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by sender category ID",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by name (case-insensitive partial match)",
              "schema": {
                "example": "WHO",
                "type": "string"
              }
            },
            {
              "name": "description",
              "required": false,
              "in": "query",
              "description": "Filter by description (case-insensitive partial match)",
              "schema": {
                "example": "World Health",
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category ID",
              "required": false,
              "name": "senderCategoryId",
              "in": "query",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "description": "Filter by name (case-insensitive partial match)",
              "required": false,
              "name": "name",
              "in": "query",
              "schema": {
                "example": "WHO",
                "type": "string"
              }
            },
            {
              "description": "Filter by description (case-insensitive partial match)",
              "required": false,
              "name": "description",
              "in": "query",
              "schema": {
                "example": "World Health",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of sender categories."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all sender categories, optionally filtered",
          "tags": [
            "Sender Categories"
          ]
        }
      },
      "/office-api/sender-categories/{id}": {
        "get": {
          "operationId": "SenderCategoryController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the sender category to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the sender category."
            },
            "404": {
              "description": "Sender category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a sender category by ID",
          "tags": [
            "Sender Categories"
          ]
        },
        "patch": {
          "operationId": "SenderCategoryController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the sender category to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSenderCategoryDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The sender category has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Sender category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing sender category by ID",
          "tags": [
            "Sender Categories"
          ]
        },
        "delete": {
          "operationId": "SenderCategoryController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the sender category to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The sender category has been successfully deleted."
            },
            "404": {
              "description": "Sender category not found."
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a sender category by ID",
          "tags": [
            "Sender Categories"
          ]
        }
      },
      "/office-api/incoming-letters": {
        "post": {
          "operationId": "IncomingLetterController_create[0]",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "subject": {
                      "type": "string",
                      "example": "Partnership Request"
                    },
                    "body": {
                      "type": "string",
                      "example": "We would like to propose...",
                      "nullable": true
                    },
                    "referenceNumber": {
                      "type": "string",
                      "example": "REF-2024-001",
                      "nullable": true
                    },
                    "internalTrackingNumber": {
                      "type": "string",
                      "example": "ITN-INC-001",
                      "nullable": true
                    },
                    "qrCode": {
                      "type": "string",
                      "example": "QR123456",
                      "nullable": true
                    },
                    "senderName": {
                      "type": "string",
                      "example": "John Doe"
                    },
                    "writtenDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2024-01-10T00:00:00Z",
                      "nullable": true
                    },
                    "receivedDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2024-01-15T10:00:00Z",
                      "nullable": true
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "sourceOrganizationId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "currentAssigneeId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000",
                      "nullable": true
                    },
                    "isUrgent": {
                      "type": "boolean",
                      "example": false,
                      "nullable": true
                    },
                    "attachmentPaths": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Main attachment files"
                    },
                    "supportDocumentPaths": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Support document files"
                    }
                  },
                  "required": [
                    "subject",
                    "senderName",
                    "priorityId",
                    "confidentialityId",
                    "languageId",
                    "sourceOrganizationId",
                    "documentCategoryId"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The incoming letter has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new incoming letter with attachments and support documents",
          "tags": [
            "Incoming Letters"
          ]
        },
        "get": {
          "operationId": "IncomingLetterController_findAll[0]",
          "parameters": [
            {
              "name": "incomingLetterId",
              "required": false,
              "in": "query",
              "description": "Filter by incoming letter ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter by subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "senderName",
              "required": false,
              "in": "query",
              "description": "Filter by sender name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by sender category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationName",
              "required": false,
              "in": "query",
              "description": "Filter by sender category name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by letter type ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryName",
              "required": false,
              "in": "query",
              "description": "Filter by letter type name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "ASSIGNED",
                  "IN_PROGRESS",
                  "FORWARDED",
                  "TRANSFERRED",
                  "RETURNED",
                  "ACCEPTED",
                  "REPLIED",
                  "COMPLETED",
                  "ARCHIVED",
                  "ESCALATED",
                  "RECALLED"
                ]
              }
            },
            {
              "name": "isUrgent",
              "required": false,
              "in": "query",
              "description": "Filter by urgent letters only",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "receivedDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter by received date from",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "receivedDateTo",
              "required": false,
              "in": "query",
              "description": "Filter by received date to",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "createdById",
              "required": false,
              "in": "query",
              "description": "Filter by created by user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceType",
              "required": false,
              "in": "query",
              "description": "Filter by source type",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee organization position ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeUserId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isRecordOffice",
              "required": false,
              "in": "query",
              "description": "Filter by record office assignments (only applicable for record officers)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "Field to sort by",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "Sort order (asc or desc)",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by incoming letter ID",
              "required": false,
              "name": "incomingLetterId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by subject (case-insensitive partial match)",
              "required": false,
              "name": "subject",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender name (case-insensitive partial match)",
              "required": false,
              "name": "senderName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by reference number",
              "required": false,
              "name": "referenceNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category ID",
              "required": false,
              "name": "sourceOrganizationId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category name",
              "required": false,
              "name": "sourceOrganizationName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type name",
              "required": false,
              "name": "documentCategoryName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee ID",
              "required": false,
              "name": "currentAssigneeId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by status",
              "required": false,
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by urgent letters only",
              "required": false,
              "name": "isUrgent",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by received date from",
              "required": false,
              "name": "receivedDateFrom",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by received date to",
              "required": false,
              "name": "receivedDateTo",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by created by user ID",
              "required": false,
              "name": "createdById",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by source type",
              "required": false,
              "name": "sourceType",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee organization position ID",
              "required": false,
              "name": "currentAssigneeOrganizationPositionId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee user ID",
              "required": false,
              "name": "currentAssigneeUserId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by record office assignments (only applicable for record officers)",
              "required": false,
              "name": "isRecordOffice",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Page number for pagination",
              "required": false,
              "name": "page",
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "description": "Number of items per page",
              "required": false,
              "name": "limit",
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "description": "Field to sort by",
              "required": false,
              "name": "sortBy",
              "in": "query",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "required": false,
              "name": "search",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Sort order (asc or desc)",
              "required": false,
              "name": "sortOrder",
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string"
              }
            },
            {
              "description": "Filter by seen status",
              "required": false,
              "name": "isSeen",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "required": false,
              "name": "waitingForAction",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "required": false,
              "name": "actionDateFrom",
              "in": "query",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "required": false,
              "name": "actionDateTo",
              "in": "query",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "required": false,
              "name": "trackingFromUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "required": false,
              "name": "trackingToUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of incoming letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all incoming letters, optionally filtered",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters": {
        "post": {
          "operationId": "IncomingLetterController_create[1]",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "subject": {
                      "type": "string",
                      "example": "Partnership Request"
                    },
                    "body": {
                      "type": "string",
                      "example": "We would like to propose...",
                      "nullable": true
                    },
                    "referenceNumber": {
                      "type": "string",
                      "example": "REF-2024-001",
                      "nullable": true
                    },
                    "internalTrackingNumber": {
                      "type": "string",
                      "example": "ITN-INC-001",
                      "nullable": true
                    },
                    "qrCode": {
                      "type": "string",
                      "example": "QR123456",
                      "nullable": true
                    },
                    "senderName": {
                      "type": "string",
                      "example": "John Doe"
                    },
                    "writtenDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2024-01-10T00:00:00Z",
                      "nullable": true
                    },
                    "receivedDate": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2024-01-15T10:00:00Z",
                      "nullable": true
                    },
                    "priorityId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "confidentialityId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "languageId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "sourceOrganizationId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000"
                    },
                    "currentAssigneeId": {
                      "type": "string",
                      "format": "uuid",
                      "example": "123e4567-e89b-12d3-a456-426614174000",
                      "nullable": true
                    },
                    "isUrgent": {
                      "type": "boolean",
                      "example": false,
                      "nullable": true
                    },
                    "attachmentPaths": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Main attachment files"
                    },
                    "supportDocumentPaths": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Support document files"
                    }
                  },
                  "required": [
                    "subject",
                    "senderName",
                    "priorityId",
                    "confidentialityId",
                    "languageId",
                    "sourceOrganizationId",
                    "documentCategoryId"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The incoming letter has been successfully created."
            },
            "400": {
              "description": "Invalid input data."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new incoming letter with attachments and support documents",
          "tags": [
            "Incoming Letters"
          ]
        },
        "get": {
          "operationId": "IncomingLetterController_findAll[1]",
          "parameters": [
            {
              "name": "incomingLetterId",
              "required": false,
              "in": "query",
              "description": "Filter by incoming letter ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter by subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "senderName",
              "required": false,
              "in": "query",
              "description": "Filter by sender name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by sender category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationName",
              "required": false,
              "in": "query",
              "description": "Filter by sender category name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by letter type ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryName",
              "required": false,
              "in": "query",
              "description": "Filter by letter type name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "ASSIGNED",
                  "IN_PROGRESS",
                  "FORWARDED",
                  "TRANSFERRED",
                  "RETURNED",
                  "ACCEPTED",
                  "REPLIED",
                  "COMPLETED",
                  "ARCHIVED",
                  "ESCALATED",
                  "RECALLED"
                ]
              }
            },
            {
              "name": "isUrgent",
              "required": false,
              "in": "query",
              "description": "Filter by urgent letters only",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "receivedDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter by received date from",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "receivedDateTo",
              "required": false,
              "in": "query",
              "description": "Filter by received date to",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "createdById",
              "required": false,
              "in": "query",
              "description": "Filter by created by user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceType",
              "required": false,
              "in": "query",
              "description": "Filter by source type",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee organization position ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeUserId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isRecordOffice",
              "required": false,
              "in": "query",
              "description": "Filter by record office assignments (only applicable for record officers)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "Field to sort by",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "Sort order (asc or desc)",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by incoming letter ID",
              "required": false,
              "name": "incomingLetterId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by subject (case-insensitive partial match)",
              "required": false,
              "name": "subject",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender name (case-insensitive partial match)",
              "required": false,
              "name": "senderName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by reference number",
              "required": false,
              "name": "referenceNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category ID",
              "required": false,
              "name": "sourceOrganizationId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category name",
              "required": false,
              "name": "sourceOrganizationName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type name",
              "required": false,
              "name": "documentCategoryName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee ID",
              "required": false,
              "name": "currentAssigneeId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by status",
              "required": false,
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by urgent letters only",
              "required": false,
              "name": "isUrgent",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by received date from",
              "required": false,
              "name": "receivedDateFrom",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by received date to",
              "required": false,
              "name": "receivedDateTo",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by created by user ID",
              "required": false,
              "name": "createdById",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by source type",
              "required": false,
              "name": "sourceType",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee organization position ID",
              "required": false,
              "name": "currentAssigneeOrganizationPositionId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee user ID",
              "required": false,
              "name": "currentAssigneeUserId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by record office assignments (only applicable for record officers)",
              "required": false,
              "name": "isRecordOffice",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Page number for pagination",
              "required": false,
              "name": "page",
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "description": "Number of items per page",
              "required": false,
              "name": "limit",
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "description": "Field to sort by",
              "required": false,
              "name": "sortBy",
              "in": "query",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "required": false,
              "name": "search",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Sort order (asc or desc)",
              "required": false,
              "name": "sortOrder",
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string"
              }
            },
            {
              "description": "Filter by seen status",
              "required": false,
              "name": "isSeen",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "required": false,
              "name": "waitingForAction",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "required": false,
              "name": "actionDateFrom",
              "in": "query",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "required": false,
              "name": "actionDateTo",
              "in": "query",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "required": false,
              "name": "trackingFromUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "required": false,
              "name": "trackingToUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved list of incoming letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all incoming letters, optionally filtered",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/assigned-to-me": {
        "get": {
          "operationId": "IncomingLetterController_getLettersAssignedToMe[0]",
          "parameters": [
            {
              "name": "incomingLetterId",
              "required": false,
              "in": "query",
              "description": "Filter by incoming letter ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter by subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "senderName",
              "required": false,
              "in": "query",
              "description": "Filter by sender name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by sender category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationName",
              "required": false,
              "in": "query",
              "description": "Filter by sender category name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by letter type ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryName",
              "required": false,
              "in": "query",
              "description": "Filter by letter type name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "ASSIGNED",
                  "IN_PROGRESS",
                  "FORWARDED",
                  "TRANSFERRED",
                  "RETURNED",
                  "ACCEPTED",
                  "REPLIED",
                  "COMPLETED",
                  "ARCHIVED",
                  "ESCALATED",
                  "RECALLED"
                ]
              }
            },
            {
              "name": "isUrgent",
              "required": false,
              "in": "query",
              "description": "Filter by urgent letters only",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "receivedDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter by received date from",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "receivedDateTo",
              "required": false,
              "in": "query",
              "description": "Filter by received date to",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "createdById",
              "required": false,
              "in": "query",
              "description": "Filter by created by user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceType",
              "required": false,
              "in": "query",
              "description": "Filter by source type",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee organization position ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeUserId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isRecordOffice",
              "required": false,
              "in": "query",
              "description": "Filter by record office assignments (only applicable for record officers)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "Field to sort by",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "Sort order (asc or desc)",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by incoming letter ID",
              "required": false,
              "name": "incomingLetterId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by subject (case-insensitive partial match)",
              "required": false,
              "name": "subject",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender name (case-insensitive partial match)",
              "required": false,
              "name": "senderName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by reference number",
              "required": false,
              "name": "referenceNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category ID",
              "required": false,
              "name": "sourceOrganizationId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category name",
              "required": false,
              "name": "sourceOrganizationName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type name",
              "required": false,
              "name": "documentCategoryName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee ID",
              "required": false,
              "name": "currentAssigneeId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by status",
              "required": false,
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by urgent letters only",
              "required": false,
              "name": "isUrgent",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by received date from",
              "required": false,
              "name": "receivedDateFrom",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by received date to",
              "required": false,
              "name": "receivedDateTo",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by created by user ID",
              "required": false,
              "name": "createdById",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by source type",
              "required": false,
              "name": "sourceType",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee organization position ID",
              "required": false,
              "name": "currentAssigneeOrganizationPositionId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee user ID",
              "required": false,
              "name": "currentAssigneeUserId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by record office assignments (only applicable for record officers)",
              "required": false,
              "name": "isRecordOffice",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Page number for pagination",
              "required": false,
              "name": "page",
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "description": "Number of items per page",
              "required": false,
              "name": "limit",
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "description": "Field to sort by",
              "required": false,
              "name": "sortBy",
              "in": "query",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "required": false,
              "name": "search",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Sort order (asc or desc)",
              "required": false,
              "name": "sortOrder",
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string"
              }
            },
            {
              "description": "Filter by seen status",
              "required": false,
              "name": "isSeen",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "required": false,
              "name": "waitingForAction",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "required": false,
              "name": "actionDateFrom",
              "in": "query",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "required": false,
              "name": "actionDateTo",
              "in": "query",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "required": false,
              "name": "trackingFromUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "required": false,
              "name": "trackingToUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved assigned letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters assigned to current user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/assigned-to-me": {
        "get": {
          "operationId": "IncomingLetterController_getLettersAssignedToMe[1]",
          "parameters": [
            {
              "name": "incomingLetterId",
              "required": false,
              "in": "query",
              "description": "Filter by incoming letter ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subject",
              "required": false,
              "in": "query",
              "description": "Filter by subject (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "senderName",
              "required": false,
              "in": "query",
              "description": "Filter by sender name (case-insensitive partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "referenceNumber",
              "required": false,
              "in": "query",
              "description": "Filter by reference number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by sender category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationName",
              "required": false,
              "in": "query",
              "description": "Filter by sender category name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by letter type ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryName",
              "required": false,
              "in": "query",
              "description": "Filter by letter type name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "ASSIGNED",
                  "IN_PROGRESS",
                  "FORWARDED",
                  "TRANSFERRED",
                  "RETURNED",
                  "ACCEPTED",
                  "REPLIED",
                  "COMPLETED",
                  "ARCHIVED",
                  "ESCALATED",
                  "RECALLED"
                ]
              }
            },
            {
              "name": "isUrgent",
              "required": false,
              "in": "query",
              "description": "Filter by urgent letters only",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "receivedDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter by received date from",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "receivedDateTo",
              "required": false,
              "in": "query",
              "description": "Filter by received date to",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "createdById",
              "required": false,
              "in": "query",
              "description": "Filter by created by user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceType",
              "required": false,
              "in": "query",
              "description": "Filter by source type",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee organization position ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAssigneeUserId",
              "required": false,
              "in": "query",
              "description": "Filter by current assignee user ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isRecordOffice",
              "required": false,
              "in": "query",
              "description": "Filter by record office assignments (only applicable for record officers)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "description": "Field to sort by",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "description": "Sort order (asc or desc)",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by seen status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "waitingForAction",
              "required": false,
              "in": "query",
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "actionDateFrom",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "actionDateTo",
              "required": false,
              "in": "query",
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "trackingFromUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "trackingToUserId",
              "required": false,
              "in": "query",
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter by incoming letter ID",
              "required": false,
              "name": "incomingLetterId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by subject (case-insensitive partial match)",
              "required": false,
              "name": "subject",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender name (case-insensitive partial match)",
              "required": false,
              "name": "senderName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by reference number",
              "required": false,
              "name": "referenceNumber",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by priority ID",
              "required": false,
              "name": "priorityId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category ID",
              "required": false,
              "name": "sourceOrganizationId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by sender category name",
              "required": false,
              "name": "sourceOrganizationName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by letter type name",
              "required": false,
              "name": "documentCategoryName",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee ID",
              "required": false,
              "name": "currentAssigneeId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by status",
              "required": false,
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by urgent letters only",
              "required": false,
              "name": "isUrgent",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by received date from",
              "required": false,
              "name": "receivedDateFrom",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by received date to",
              "required": false,
              "name": "receivedDateTo",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by created by user ID",
              "required": false,
              "name": "createdById",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by source type",
              "required": false,
              "name": "sourceType",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee organization position ID",
              "required": false,
              "name": "currentAssigneeOrganizationPositionId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by current assignee user ID",
              "required": false,
              "name": "currentAssigneeUserId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by record office assignments (only applicable for record officers)",
              "required": false,
              "name": "isRecordOffice",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Page number for pagination",
              "required": false,
              "name": "page",
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "description": "Number of items per page",
              "required": false,
              "name": "limit",
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "description": "Field to sort by",
              "required": false,
              "name": "sortBy",
              "in": "query",
              "schema": {
                "example": "receivedDate",
                "type": "string"
              }
            },
            {
              "description": "Generic search term (searches subject, reference number, sender name, etc.)",
              "required": false,
              "name": "search",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Sort order (asc or desc)",
              "required": false,
              "name": "sortOrder",
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string"
              }
            },
            {
              "description": "Filter by seen status",
              "required": false,
              "name": "isSeen",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter by letters waiting for action (seen but assigned to me)",
              "required": false,
              "name": "waitingForAction",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or after this date.",
              "required": false,
              "name": "actionDateFrom",
              "in": "query",
              "schema": {
                "example": "2026-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters where a tracking action occurred on or before this date.",
              "required": false,
              "name": "actionDateTo",
              "in": "query",
              "schema": {
                "example": "2026-03-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who performed a tracking action (fromUserId).",
              "required": false,
              "name": "trackingFromUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "description": "Filter letters by the user ID who received a tracking action (toUserId).",
              "required": false,
              "name": "trackingToUserId",
              "in": "query",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved assigned letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters assigned to current user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/user/unseen-letters-count": {
        "get": {
          "operationId": "IncomingLetterController_getUnseenLettersCount[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen letters retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen letters for user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/user/unseen-letters-count": {
        "get": {
          "operationId": "IncomingLetterController_getUnseenLettersCount[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Count of unseen letters retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get count of unseen letters for user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/child-organizations": {
        "get": {
          "description": "Get direct child organizations that the current user can forward letters to.",
          "operationId": "IncomingLetterController_getChildOrganizations[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of child organizations retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get child organizations for forwarding",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/child-organizations": {
        "get": {
          "description": "Get direct child organizations that the current user can forward letters to.",
          "operationId": "IncomingLetterController_getChildOrganizations[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of child organizations retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get child organizations for forwarding",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/workflow": {
        "get": {
          "operationId": "IncomingLetterController_getWorkflowHistory[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved workflow history."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get workflow history for incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/workflow": {
        "get": {
          "operationId": "IncomingLetterController_getWorkflowHistory[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved workflow history."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get workflow history for incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}": {
        "get": {
          "operationId": "IncomingLetterController_findOne[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the incoming letter."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        },
        "patch": {
          "operationId": "IncomingLetterController_update[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateIncomingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The incoming letter has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        },
        "delete": {
          "operationId": "IncomingLetterController_remove[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The incoming letter has been successfully deleted."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}": {
        "get": {
          "operationId": "IncomingLetterController_findOne[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to retrieve.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved the incoming letter."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve an incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        },
        "patch": {
          "operationId": "IncomingLetterController_update[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateIncomingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The incoming letter has been successfully updated."
            },
            "400": {
              "description": "Invalid input data."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update an existing incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        },
        "delete": {
          "operationId": "IncomingLetterController_remove[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "The incoming letter has been successfully deleted."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete an incoming letter by ID",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/attachments": {
        "post": {
          "operationId": "IncomingLetterController_uploadAttachments[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Attachments have been successfully uploaded."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Upload attachments for an incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/attachments": {
        "post": {
          "operationId": "IncomingLetterController_uploadAttachments[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Attachments have been successfully uploaded."
            },
            "404": {
              "description": "Incoming letter not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Upload attachments for an incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/forward": {
        "patch": {
          "operationId": "IncomingLetterController_forwardToSubordinate[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Array of target subordinate user IDs",
                      "minItems": 1
                    },
                    "decision": {
                      "type": "string",
                      "description": "Decision text for forwarding"
                    },
                    "ccUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Optional CC users"
                    },
                    "note": {
                      "type": "string",
                      "description": "Optional note"
                    }
                  },
                  "required": [
                    "toUserIds",
                    "decision"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to subordinate."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to direct subordinate",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/forward": {
        "patch": {
          "operationId": "IncomingLetterController_forwardToSubordinate[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Array of target subordinate user IDs",
                      "minItems": 1
                    },
                    "decision": {
                      "type": "string",
                      "description": "Decision text for forwarding"
                    },
                    "ccUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Optional CC users"
                    },
                    "note": {
                      "type": "string",
                      "description": "Optional note"
                    }
                  },
                  "required": [
                    "toUserIds",
                    "decision"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to subordinate."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to direct subordinate",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/forward-any-subordinate": {
        "patch": {
          "operationId": "IncomingLetterController_forwardToAnySubordinate[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Target subordinate user ID (direct or indirect)"
                    },
                    "decision": {
                      "type": "string",
                      "description": "Decision text for forwarding"
                    },
                    "ccUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Optional CC users"
                    },
                    "note": {
                      "type": "string",
                      "description": "Optional note"
                    }
                  },
                  "required": [
                    "toUserId",
                    "decision"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to subordinate."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to any subordinate up to 4 levels down",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/forward-any-subordinate": {
        "patch": {
          "operationId": "IncomingLetterController_forwardToAnySubordinate[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Target subordinate user ID (direct or indirect)"
                    },
                    "decision": {
                      "type": "string",
                      "description": "Decision text for forwarding"
                    },
                    "ccUserIds": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "description": "Optional CC users"
                    },
                    "note": {
                      "type": "string",
                      "description": "Optional note"
                    }
                  },
                  "required": [
                    "toUserId",
                    "decision"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to subordinate."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to any subordinate up to 4 levels down",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/filter-by-date": {
        "get": {
          "operationId": "IncomingLetterController_filterIncomingLetterByDate[0]",
          "parameters": [
            {
              "name": "toDate",
              "required": false,
              "in": "path",
              "description": "The to date.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "path",
              "description": "The from date.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "toUserId",
              "required": false,
              "in": "path",
              "description": "The UUID of the to user.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "fromUserId",
              "required": false,
              "in": "path",
              "description": "The UUID of the from user.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully filtered incoming letters by date."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Filter incoming letters by date",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/filter-by-date": {
        "get": {
          "operationId": "IncomingLetterController_filterIncomingLetterByDate[1]",
          "parameters": [
            {
              "name": "toDate",
              "required": false,
              "in": "path",
              "description": "The to date.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "path",
              "description": "The from date.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "toUserId",
              "required": false,
              "in": "path",
              "description": "The UUID of the to user.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "fromUserId",
              "required": false,
              "in": "path",
              "description": "The UUID of the from user.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully filtered incoming letters by date."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Filter incoming letters by date",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/forward-to-organization-position": {
        "post": {
          "operationId": "IncomingLetterController_forwardToOrganizationPosition[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOrganizationPositionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to organization position."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to an organization position",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/forward-to-organization-position": {
        "post": {
          "operationId": "IncomingLetterController_forwardToOrganizationPosition[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOrganizationPositionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to organization position."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to an organization position",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/forward-to-organization": {
        "patch": {
          "description": "Forward the letter to a direct child organization. The system will automatically assign it to the appropriate head of that organization (e.g., Director General).",
          "operationId": "IncomingLetterController_forwardToOrganization[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to the organization head."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to a child organization",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/forward-to-organization": {
        "patch": {
          "description": "Forward the letter to a direct child organization. The system will automatically assign it to the appropriate head of that organization (e.g., Director General).",
          "operationId": "IncomingLetterController_forwardToOrganization[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardToOrganizationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully forwarded to the organization head."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forward incoming letter to a child organization",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/transfer": {
        "patch": {
          "operationId": "IncomingLetterController_transferToPeer[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Target peer user ID"
                    },
                    "transferNote": {
                      "type": "string",
                      "description": "Note explaining the transfer"
                    }
                  },
                  "required": [
                    "toUserId",
                    "transferNote"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully transferred to peer."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer incoming letter to peer at same level",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/transfer": {
        "patch": {
          "operationId": "IncomingLetterController_transferToPeer[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "toUserId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Target peer user ID"
                    },
                    "transferNote": {
                      "type": "string",
                      "description": "Note explaining the transfer"
                    }
                  },
                  "required": [
                    "toUserId",
                    "transferNote"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully transferred to peer."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Transfer incoming letter to peer at same level",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/return": {
        "patch": {
          "operationId": "IncomingLetterController_returnLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to return.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "description": "Reason for returning the letter"
                    },
                    "note": {
                      "type": "string",
                      "description": "Additional note (optional)"
                    }
                  },
                  "required": [
                    "reason"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully returned to previous sender."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Return incoming letter following workflow path",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/return": {
        "patch": {
          "operationId": "IncomingLetterController_returnLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to return.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "description": "Reason for returning the letter"
                    },
                    "note": {
                      "type": "string",
                      "description": "Additional note (optional)"
                    }
                  },
                  "required": [
                    "reason"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully returned to previous sender."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Return incoming letter following workflow path",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/recall": {
        "patch": {
          "operationId": "IncomingLetterController_recallAction[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to recall action for.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "description": "Reason for recalling the action"
                    }
                  },
                  "required": [
                    "reason"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Action has been successfully recalled."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Recall a previously performed action on incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/recall": {
        "patch": {
          "operationId": "IncomingLetterController_recallAction[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to recall action for.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "description": "Reason for recalling the action"
                    }
                  },
                  "required": [
                    "reason"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Action has been successfully recalled."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Recall a previously performed action on incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/escalate": {
        "patch": {
          "operationId": "IncomingLetterController_escalateToSupervisor[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to escalate.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateIncomingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully escalated to supervisor."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate incoming letter to immediate supervisor",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/escalate": {
        "patch": {
          "operationId": "IncomingLetterController_escalateToSupervisor[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter to escalate.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EscalateIncomingLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Letter has been successfully escalated to supervisor."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Escalate incoming letter to immediate supervisor",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/accept": {
        "patch": {
          "operationId": "IncomingLetterController_acceptLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter has been successfully accepted."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Accept incoming letter and take ownership",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/accept": {
        "patch": {
          "operationId": "IncomingLetterController_acceptLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter has been successfully accepted."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Accept incoming letter and take ownership",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/complete": {
        "patch": {
          "operationId": "IncomingLetterController_completeLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter has been successfully completed."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Complete incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/complete": {
        "patch": {
          "operationId": "IncomingLetterController_completeLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter has been successfully completed."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Complete incoming letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{id}/reply": {
        "patch": {
          "operationId": "IncomingLetterController_replyToLetter[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReplyToLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Reply has been successfully created."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Reply to incoming letter by creating outgoing letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{id}/reply": {
        "patch": {
          "operationId": "IncomingLetterController_replyToLetter[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the incoming letter.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReplyToLetterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Reply has been successfully created."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Reply to incoming letter by creating outgoing letter",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/subordinates": {
        "get": {
          "operationId": "IncomingLetterController_getSubordinates[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get subordinates for forwarding letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/subordinates": {
        "get": {
          "operationId": "IncomingLetterController_getSubordinates[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get subordinates for forwarding letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/peers": {
        "get": {
          "operationId": "IncomingLetterController_getPeers[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved peers."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get peers for transferring letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/peers": {
        "get": {
          "operationId": "IncomingLetterController_getPeers[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved peers."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get peers for transferring letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/supervisor": {
        "get": {
          "operationId": "IncomingLetterController_getSupervisor[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisor."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get supervisor for returning letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/supervisor": {
        "get": {
          "operationId": "IncomingLetterController_getSupervisor[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisor."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get supervisor for returning letters",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/assigned-to-position/{positionId}": {
        "get": {
          "operationId": "IncomingLetterController_getLettersAssignedToPosition[0]",
          "parameters": [
            {
              "name": "positionId",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization position.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved letters assigned to position."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters assigned to organization position",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/assigned-to-position/{positionId}": {
        "get": {
          "operationId": "IncomingLetterController_getLettersAssignedToPosition[1]",
          "parameters": [
            {
              "name": "positionId",
              "required": true,
              "in": "path",
              "description": "The UUID of the organization position.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved letters assigned to position."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters assigned to organization position",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/all-subordinates": {
        "get": {
          "operationId": "IncomingLetterController_getAllSubordinate[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all subordinates up to 4 levels down for record office",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/all-subordinates": {
        "get": {
          "operationId": "IncomingLetterController_getAllSubordinate[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved subordinates."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all subordinates up to 4 levels down for record office",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/cc/my-letters": {
        "get": {
          "operationId": "IncomingLetterController_getLettersCCedToMe[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved CC'd letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters that are CC'd to the authenticated user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/cc/my-letters": {
        "get": {
          "operationId": "IncomingLetterController_getLettersCCedToMe[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved CC'd letters."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get letters that are CC'd to the authenticated user",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/all-supervisors": {
        "get": {
          "operationId": "IncomingLetterController_getAllSupervisors[0]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisors."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all supervisors from bottom to top",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/all-supervisors": {
        "get": {
          "operationId": "IncomingLetterController_getAllSupervisors[1]",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisors."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all supervisors from bottom to top",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/users/{id}/all-supervisors": {
        "get": {
          "operationId": "IncomingLetterController_getAllSupervisorsExcludingRecordOffice[0]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisors."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all supervisors from bottom to top",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/users/{id}/all-supervisors": {
        "get": {
          "operationId": "IncomingLetterController_getAllSupervisorsExcludingRecordOffice[1]",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved supervisors."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all supervisors from bottom to top",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/files/stream": {
        "get": {
          "operationId": "IncomingLetterController_streamFile[0]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The file path in MinIO storage.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File streamed successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream an incoming letter file through the backend",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/files/stream": {
        "get": {
          "operationId": "IncomingLetterController_streamFile[1]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "The file path in MinIO storage.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File streamed successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream an incoming letter file through the backend",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/files/{filePath}": {
        "get": {
          "operationId": "IncomingLetterController_getFileUrl[0]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "path",
              "description": "The file path in MinIO storage.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Backend URL generated successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a backend URL for incoming letter file preview",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/files/{filePath}": {
        "get": {
          "operationId": "IncomingLetterController_getFileUrl[1]",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "path",
              "description": "The file path in MinIO storage.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Backend URL generated successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a backend URL for incoming letter file preview",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/incoming-letters/{qrCode}/checkQR": {
        "get": {
          "operationId": "IncomingLetterController_getQRLetter[0]",
          "parameters": [
            {
              "name": "qrCode",
              "required": true,
              "in": "path",
              "description": "The QR code of the incoming letter.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter details retrieved successfully.",
              "content": {
                "text/html": {
                  "schema": {
                    "type": "string",
                    "description": "HTML page displaying letter details"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get incoming letter by QR code (public access - no auth required)",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/api/incoming-letters/{qrCode}/checkQR": {
        "get": {
          "operationId": "IncomingLetterController_getQRLetter[1]",
          "parameters": [
            {
              "name": "qrCode",
              "required": true,
              "in": "path",
              "description": "The QR code of the incoming letter.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter details retrieved successfully.",
              "content": {
                "text/html": {
                  "schema": {
                    "type": "string",
                    "description": "HTML page displaying letter details"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get incoming letter by QR code (public access - no auth required)",
          "tags": [
            "Incoming Letters"
          ]
        }
      },
      "/office-api/record-office-document-categories/assign": {
        "post": {
          "description": "Creates an assignment between a document category and a record office organization",
          "operationId": "RecordOfficeDocumentCategoryController_assignDocumentCategory",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AssignDocumentCategoryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document category successfully assigned to record office",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Organization is not a record office or invalid data"
            },
            "404": {
              "description": "Organization or document category not found"
            },
            "409": {
              "description": "Assignment already exists"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign a document category to a record office",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/{organizationId}/{documentCategoryId}": {
        "delete": {
          "description": "Deactivates the assignment between a document category and a record office",
          "operationId": "RecordOfficeDocumentCategoryController_deassignDocumentCategory",
          "parameters": [
            {
              "name": "organizationId",
              "required": true,
              "in": "path",
              "description": "The UUID of the record office organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "letterTypeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Assignment successfully removed"
            },
            "404": {
              "description": "Assignment not found or already inactive"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Remove assignment of document category from record office",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/reassign": {
        "post": {
          "description": "Moves a document category assignment from one record office to another",
          "operationId": "RecordOfficeDocumentCategoryController_reassignDocumentCategory",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "documentCategoryId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The UUID of the document category to reassign"
                    },
                    "newOrganizationId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The UUID of the new record office organization"
                    }
                  },
                  "required": [
                    "documentCategoryId",
                    "newOrganizationId"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Document category successfully reassigned",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "New organization is not a record office or invalid data"
            },
            "404": {
              "description": "Document category or organization not found"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Reassign a document category to a different record office",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories": {
        "get": {
          "description": "Retrieves all assignments between document categories and record offices with optional filtering",
          "operationId": "RecordOfficeDocumentCategoryController_findAllAssignments",
          "parameters": [
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization ID",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by document category ID",
              "schema": {
                "format": "uuid",
                "example": "123e4567-e89b-12d3-a456-426614174001",
                "type": "string"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "description": "Filter by active status",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of assignments retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all document category assignments",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/by-letter-type/{letterTypeId}": {
        "get": {
          "description": "Retrieves all record offices that handle a specific letter type",
          "operationId": "RecordOfficeDocumentCategoryController_getRecordOfficesByLetterType",
          "parameters": [
            {
              "name": "letterTypeId",
              "required": true,
              "in": "path",
              "description": "The ID of the letter type",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of record offices that handle the specified letter type",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Letter type not found"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get record offices by letter type",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/by-category/{documentCategoryId}": {
        "get": {
          "description": "Retrieves all record offices that handle a specific document category",
          "operationId": "RecordOfficeDocumentCategoryController_getRecordOfficesByCategory",
          "parameters": [
            {
              "name": "documentCategoryId",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of record offices for the category retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Document category not found"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get record offices by document category",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/by-record-office/{organizationId}": {
        "get": {
          "description": "Retrieves all document categories handled by a specific record office",
          "operationId": "RecordOfficeDocumentCategoryController_getCategoriesByRecordOffice",
          "parameters": [
            {
              "name": "organizationId",
              "required": true,
              "in": "path",
              "description": "The UUID of the record office organization",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of document categories for the record office retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/RecordOfficeAssignmentResponseDto"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Organization is not a record office"
            },
            "404": {
              "description": "Organization not found"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get document categories by record office",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/record-offices": {
        "get": {
          "description": "Retrieves all organizations that are designated as record offices",
          "operationId": "RecordOfficeDocumentCategoryController_getAllRecordOffices",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of record offices retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all record offices",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/record-office-document-categories/find-record-office/{documentCategoryId}": {
        "get": {
          "description": "Finds which record office(s) should handle documents of a specific category",
          "operationId": "RecordOfficeDocumentCategoryController_findRecordOfficeForDocument",
          "parameters": [
            {
              "name": "documentCategoryId",
              "required": true,
              "in": "path",
              "description": "The UUID of the document category",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Record office information retrieved successfully"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Find record office for document category",
          "tags": [
            "Record Office Document Categories"
          ]
        }
      },
      "/office-api/chat/rooms/private": {
        "post": {
          "operationId": "ChatController_createPrivateRoom",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePrivateRoomDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The private room has been successfully created or retrieved."
            },
            "400": {
              "description": "Bad Request. Cannot create a chat with yourself."
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new private (1-to-1) chat room",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/group": {
        "post": {
          "operationId": "ChatController_createGroupRoom",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateGroupRoomDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The group room has been successfully created."
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new group chat room",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/messages/{messageId}": {
        "patch": {
          "operationId": "ChatController_editMessage",
          "parameters": [
            {
              "name": "messageId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EditMessageDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Message updated successfully."
            },
            "403": {
              "description": "Forbidden. Not your message."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Edit an existing message",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/delete-message/{messageId}/delete": {
        "patch": {
          "operationId": "ChatController_softDeleteMessage",
          "parameters": [
            {
              "name": "messageId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Message soft-deleted successfully."
            },
            "403": {
              "description": "Forbidden. Not your message."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Soft-delete a message (only sender can do this)",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms": {
        "get": {
          "operationId": "ChatController_getUserRooms",
          "parameters": [],
          "responses": {
            "200": {
              "description": "A list of chat rooms."
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all chat rooms for the current user",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/{roomId}/rename": {
        "patch": {
          "operationId": "ChatController_renameRoom",
          "parameters": [
            {
              "name": "roomId",
              "required": true,
              "in": "path",
              "description": "The ID of the group chat room to rename.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RenameRoomDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Room renamed successfully."
            },
            "400": {
              "description": "Bad Request. The room is not a group chat or the new name is invalid."
            },
            "403": {
              "description": "Forbidden. Only the group creator can rename it."
            },
            "404": {
              "description": "Chat room not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Rename a Group chat room",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/{roomId}/messages": {
        "get": {
          "operationId": "ChatController_getMessages",
          "parameters": [
            {
              "name": "roomId",
              "required": true,
              "in": "path",
              "description": "The ID of the chat room.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The page number to retrieve.",
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items to retrieve per page.",
              "schema": {
                "maximum": 100,
                "default": 20,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "A paginated list of messages."
            },
            "401": {
              "description": "Unauthorized."
            },
            "403": {
              "description": "Forbidden. User is not a member of the room."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get paginated messages for a specific chat room",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/{roomId}/files": {
        "post": {
          "operationId": "ChatController_uploadFiles",
          "parameters": [
            {
              "name": "roomId",
              "required": true,
              "in": "path",
              "description": "The ID of the chat room to upload files to.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "files": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Up to 10 files to upload."
                    },
                    "content": {
                      "type": "string",
                      "description": "Optional text message to send with the files."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "File message created successfully."
            },
            "401": {
              "description": "Unauthorized."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Upload one or more files to a chat room",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/{roomId}/members": {
        "post": {
          "operationId": "ChatController_addMembers",
          "parameters": [
            {
              "name": "roomId",
              "required": true,
              "in": "path",
              "description": "The ID of the group chat.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddMembersDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Members added successfully."
            },
            "401": {
              "description": "Unauthorized."
            },
            "403": {
              "description": "Forbidden. User is not a member of the room."
            },
            "404": {
              "description": "Group chat not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Add one or more members to a group chat",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/rooms/{roomId}/members/{memberId}": {
        "delete": {
          "operationId": "ChatController_removeMember",
          "parameters": [
            {
              "name": "roomId",
              "required": true,
              "in": "path",
              "description": "The ID of the group chat.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            },
            {
              "name": "memberId",
              "required": true,
              "in": "path",
              "description": "The ID of the member to remove.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Member removed successfully."
            },
            "401": {
              "description": "Unauthorized."
            },
            "403": {
              "description": "Forbidden. You do not have permission to remove this member."
            },
            "404": {
              "description": "Group chat or member not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Remove a member from a group chat",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/view/view-file": {
        "get": {
          "operationId": "ChatController_viewFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path for chat file",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a backend URL to view the file.",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "url": "/chat/view/file-stream?filePath=document-storage%2Fchat%2Fa4de54d4-f03d-43d1-8ed1-c9e5851227ab%2Fa4de54d4-f03d-43d1-8ed1-c9e5851227ab.pdf"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "View chat file through the backend stream URL",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/chat/view/file-stream": {
        "get": {
          "operationId": "ChatController_streamFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "description": "MinIO file path for chat file",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File streamed successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream chat file through the backend",
          "tags": [
            "Chat"
          ]
        }
      },
      "/office-api/record-centers": {
        "post": {
          "operationId": "RecordCenterController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRecordCenterDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Location has been successfully created."
            },
            "409": {
              "description": "Location with this code already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new location",
          "tags": [
            "Record Centers"
          ]
        },
        "get": {
          "operationId": "RecordCenterController_findAll",
          "parameters": [
            {
              "name": "name",
              "required": false,
              "in": "query",
              "description": "Filter by location name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "code",
              "required": false,
              "in": "query",
              "description": "Filter by location code",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "description": "Filter by active status",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "includeShelves",
              "required": false,
              "in": "query",
              "description": "Include shelf information",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of locations retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all locations",
          "tags": [
            "Record Centers"
          ]
        }
      },
      "/office-api/record-centers/capacity-statistics": {
        "get": {
          "operationId": "RecordCenterController_getCapacityStatistics",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Capacity statistics retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get capacity statistics for all locations",
          "tags": [
            "Record Centers"
          ]
        }
      },
      "/office-api/record-centers/{id}": {
        "get": {
          "operationId": "RecordCenterController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Location ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Location retrieved successfully."
            },
            "404": {
              "description": "Location not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a location by ID",
          "tags": [
            "Record Centers"
          ]
        },
        "patch": {
          "operationId": "RecordCenterController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Location ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRecordCenterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Location has been successfully updated."
            },
            "404": {
              "description": "Location not found."
            },
            "409": {
              "description": "Location with this code already exists."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update a location",
          "tags": [
            "Record Centers"
          ]
        },
        "delete": {
          "operationId": "RecordCenterController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Location ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Location has been successfully deleted."
            },
            "404": {
              "description": "Location not found."
            },
            "409": {
              "description": "Cannot delete location with occupied shelf rows."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a location",
          "tags": [
            "Record Centers"
          ]
        }
      },
      "/office-api/record-centers/{id}/shelves": {
        "get": {
          "operationId": "RecordCenterController_getRecordCenterShelves",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Location ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Location shelves retrieved successfully."
            },
            "404": {
              "description": "Location not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get shelves for a specific location",
          "tags": [
            "Record Centers"
          ]
        }
      },
      "/office-api/jobs": {
        "post": {
          "operationId": "JobController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Job title"
                    },
                    "description": {
                      "type": "string",
                      "description": "Job description"
                    },
                    "fileAttachment": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Optional file attachments (Max 5 files)"
                    }
                  },
                  "required": [
                    "description"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Job successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new job with optional file attachments (Multi-form Data).",
          "tags": [
            "Job Management"
          ]
        },
        "get": {
          "operationId": "JobController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by job status",
              "schema": {
                "example": "pending",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of jobs retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a paginated list of all jobs, optionally filtered by status.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/job-creation": {
        "post": {
          "operationId": "JobController_createJobAndAssignment",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/CreateJobWithAssignmentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The job and its assignments have been successfully created.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden: Unauthorized to create job."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create a new job AND assign it to users simultaneously.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/job-assignment/{jobId}": {
        "patch": {
          "operationId": "JobController_updateJobAndAssignment",
          "parameters": [
            {
              "name": "jobId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateJobWithAssignmentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "The job and its assignments have been successfully updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden: Unauthorized or job is in an un-editable status."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update job details, file attachments, and assignment details simultaneously.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/files/view": {
        "get": {
          "description": "Requires the full MinIO object key (path) as a query parameter.",
          "operationId": "JobController_getFileViewUrl",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "The full MinIO object key (e.g., jobs/uuid/file_name.pdf)",
              "schema": {
                "example": "jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef/report-123.pdf",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a backend URL.",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "url": {
                        "type": "string",
                        "format": "url",
                        "example": "/office-api/jobs/files/stream?path=jobs%2Fa1b2c3d4-e5f6-7890-1234-567890abcdef%2Freport-123.pdf"
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get a backend stream URL to view a job file.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/files/stream": {
        "get": {
          "operationId": "JobController_streamFile",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "The full MinIO object key (path).",
              "schema": {
                "example": "jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef/report-123.pdf",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Stream a job file through the backend.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/files/download": {
        "get": {
          "description": "Sets Content-Disposition header to force download.",
          "operationId": "JobController_downloadFile",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "query",
              "description": "The full MinIO object key (path).",
              "schema": {
                "example": "jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef/report-123.pdf",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File stream retrieved successfully.",
              "content": {
                "application/octet-stream": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Downloads a file directly by streaming its content from MinIO.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/created-by-me": {
        "get": {
          "operationId": "JobController_findJobsCreatedByMe",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by job status",
              "schema": {
                "example": "pending",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of created Jobs retrieved successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a paginated list of Jobs created by the currently logged-in user.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/jobs/{jobId}": {
        "get": {
          "operationId": "JobController_findOne",
          "parameters": [
            {
              "name": "jobId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Job retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Job not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a single job by its ID.",
          "tags": [
            "Job Management"
          ]
        },
        "patch": {
          "operationId": "JobController_update",
          "parameters": [
            {
              "name": "jobId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job to update.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Job title"
                    },
                    "description": {
                      "type": "string",
                      "description": "Optional new description"
                    },
                    "fileAttachment": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Array of NEW files to upload. Max 5 files."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Job updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update job details, upload new files, and delete existing files (Multi-form Data).",
          "tags": [
            "Job Management"
          ]
        },
        "delete": {
          "operationId": "JobController_delete",
          "parameters": [
            {
              "name": "jobId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job to delete.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Job successfully deleted.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden: Unauthorized to delete job."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete a job by ID and its associated files from MinIO.",
          "tags": [
            "Job Management"
          ]
        }
      },
      "/office-api/job-assignments": {
        "post": {
          "operationId": "JobAssignmentController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateJobAssignmentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Job successfully assigned, and job status updated.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/JobAssignmentResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Assign a Job to one or more users and update the parent Job status to \"in progress\".",
          "tags": [
            "Job Assignment Management"
          ]
        },
        "get": {
          "operationId": "JobAssignmentController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by assignment status",
              "schema": {
                "example": "pending",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by read/unread status",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of all assignments retrieved."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a paginated list of all job assignments (for Admin/Assigner view).",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/{assignmentId}/forward": {
        "post": {
          "description": "The original assignment is marked as \"forwarded\", and new assignments are created with a historical link.",
          "operationId": "JobAssignmentController_forwardAssignment",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the assignment that is currently assigned to the active user.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForwardJobAssignmentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Assignment successfully forwarded, and new assignments created.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/JobAssignmentResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Forwards an assignment to one or more new users. Only the current assignee can perform this action.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/job/{jobId}/finalize-review": {
        "patch": {
          "description": "Checks all assignments are finalized (\"approved\" or \"rejected\") and sets the parent Job status.",
          "operationId": "JobAssignmentController_submitJobReview",
          "parameters": [
            {
              "name": "jobId",
              "required": true,
              "in": "path",
              "description": "The UUID of the parent Job being finalized.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SubmitReviewDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Job finalized successfully."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Finalizes the entire Job after all its associated assignments have been reviewed.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/{assignmentId}/submit": {
        "patch": {
          "description": "Deletes existing files, uploads new files, updates feedback text, and sets status to \"submitted\".",
          "operationId": "JobAssignmentController_submitResponse",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the assignment being submitted.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/SubmitAssignmentResponseDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Assignment response submitted successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobAssignmentResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Submits the completed work for a job assignment (feedback and files). Only the assigned user can submit.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/{assignmentId}/review": {
        "patch": {
          "description": "Updates the review comment and sets the final status to \"approved\" or \"rejected\".",
          "operationId": "JobAssignmentController_submitReview",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the assignment being reviewed.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SubmitReviewDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Assignment review submitted successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobAssignmentResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Submits review and finalizes the status of a submitted job assignment. Only the assigner can review.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/assigned-by-me": {
        "get": {
          "operationId": "JobAssignmentController_findAssignmentsAssignedByMe",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by assignment status",
              "schema": {
                "example": "pending",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by read/unread status",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of assignments created by the active user retrieved."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a paginated list of job assignments created (assigned) by the currently logged-in user.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/{assignmentId}/eligible-users": {
        "get": {
          "description": "Uses the active user's organization to filter the list of eligible users.",
          "operationId": "JobAssignmentController_eligibleUsersForJobAssignment",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job assignment to check against.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of eligible subordinate users.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/UserResponseDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieves eligible subordinate users for a job reassignment, excluding the current assignee.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/my-assignments": {
        "get": {
          "operationId": "JobAssignmentController_findMyAssignments",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "example": 20,
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by assignment status",
              "schema": {
                "example": "pending",
                "type": "string"
              }
            },
            {
              "name": "isSeen",
              "required": false,
              "in": "query",
              "description": "Filter by read/unread status",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of assigned tasks retrieved for the active user."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a paginated list of assignments belonging to the currently logged-in user.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-assignments/{assignmentId}": {
        "get": {
          "operationId": "JobAssignmentController_findOne",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "path",
              "description": "The UUID of the job assignment.",
              "schema": {
                "format": "uuid",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Assignment retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/JobAssignmentResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Assignment not found."
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a single job assignment by its ID.",
          "tags": [
            "Job Assignment Management"
          ]
        }
      },
      "/office-api/job-feedback-conversion": {
        "get": {
          "operationId": "JobFeedbackConversionController_getAll",
          "parameters": [
            {
              "name": "assignmentId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all feedback for an assignment",
          "tags": [
            "Job Feedback Conversation"
          ]
        },
        "post": {
          "operationId": "JobFeedbackConversionController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateFeedbackDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Create new feedback",
          "tags": [
            "Job Feedback Conversation"
          ]
        },
        "put": {
          "operationId": "JobFeedbackConversionController_update",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateFeedbackDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Update feedback",
          "tags": [
            "Job Feedback Conversation"
          ]
        },
        "delete": {
          "operationId": "JobFeedbackConversionController_delete",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DeleteFeedbackDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Delete feedback",
          "tags": [
            "Job Feedback Conversation"
          ]
        }
      },
      "/office-api/job-feedback-conversion/see-all": {
        "post": {
          "operationId": "JobFeedbackConversionController_seeAllFeedBack",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SeeAllFeedbackDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Mark all received feedback as seen",
          "tags": [
            "Job Feedback Conversation"
          ]
        }
      },
      "/office-api/dashboard/overview": {
        "get": {
          "description": "Returns overview statistics including counts for letters, documents by status",
          "operationId": "DashboardController_getOverviewStatistics",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO date string)",
              "schema": {
                "example": "2025-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO date string)",
              "schema": {
                "example": "2025-12-31",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Dashboard overview statistics retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DashboardOverviewDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Get dashboard overview statistics",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/office-api/dashboard/letter-statistics": {
        "get": {
          "description": "Returns time series data for letters with filtering by type and period",
          "operationId": "DashboardController_getLetterStatistics",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (overrides year)",
              "schema": {
                "example": "2025-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (overrides year)",
              "schema": {
                "example": "2025-12-31",
                "type": "string"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Type of letters to include",
              "schema": {
                "enum": [
                  "incoming",
                  "outgoing",
                  "memo",
                  "all"
                ],
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period for grouping",
              "schema": {
                "enum": [
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly"
                ],
                "type": "string"
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "description": "Year for filtering",
              "schema": {
                "example": 2025,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter statistics retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterStatisticsDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Get letter statistics time series",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/office-api/dashboard/letter-breakdown": {
        "get": {
          "description": "Returns breakdown of letters by type for pie chart visualization",
          "operationId": "DashboardController_getLetterBreakdown",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO date string)",
              "schema": {
                "example": "2025-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO date string)",
              "schema": {
                "example": "2025-12-31",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Letter breakdown retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LetterBreakdownDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Get letter breakdown by type",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/office-api/dashboard/top-senders": {
        "get": {
          "description": "Returns top senders by letter count with configurable period and limit",
          "operationId": "DashboardController_getTopSenders",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO date string)",
              "schema": {
                "example": "2025-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO date string)",
              "schema": {
                "example": "2025-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period for analysis",
              "schema": {
                "enum": [
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly"
                ],
                "type": "string"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Maximum number of top senders to return (1-20)",
              "schema": {
                "example": 6,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Top senders analytics retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TopSendersDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            },
            {
              "accessToken": []
            }
          ],
          "summary": "Get top senders analytics",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/office-api/audit": {
        "get": {
          "description": "\n    This endpoint provides comprehensive audit trail access with:\n    - Cursor-based pagination for performance\n    - Multiple filtering options (model, action, user, dates)\n    - Ethiopian calendar support\n    - Field projection to reduce payload size\n    - Search capabilities\n    **Performance Notes:**\n    - Use cursor-based pagination for large datasets\n    - Use field projection (select parameter) to reduce response size\n    - Indexes are optimized for common queries\n    ",
          "operationId": "AuditController_findAll",
          "parameters": [
            {
              "name": "cursor",
              "required": false,
              "in": "query",
              "description": "Cursor for pagination (audit ID)",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "description": "Number of records to return",
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 50,
                "example": 50,
                "type": "number"
              }
            },
            {
              "name": "modelName",
              "required": false,
              "in": "query",
              "description": "Model name to filter by",
              "schema": {
                "example": "OutgoingLetter",
                "type": "string"
              }
            },
            {
              "name": "recordId",
              "required": false,
              "in": "query",
              "description": "Record ID to filter by",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "action",
              "required": false,
              "in": "query",
              "description": "Action type to filter by",
              "schema": {
                "enum": [
                  "CREATE",
                  "UPDATE",
                  "DELETE",
                  "READ",
                  "EXPORT",
                  "FORWARD",
                  "ESCALATE",
                  "DISPATCH",
                  "RETURN",
                  "RECALL",
                  "APPROVE",
                  "REJECT"
                ],
                "type": "string"
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "User ID who performed the action",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "createdByOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Organization position ID",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-01-01T00:00:00Z",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-12-31T23:59:59Z",
                "type": "string"
              }
            },
            {
              "name": "ethiopianYear",
              "required": false,
              "in": "query",
              "description": "Ethiopian year to filter by",
              "schema": {
                "example": 2017,
                "type": "number"
              }
            },
            {
              "name": "ethiopianMonth",
              "required": false,
              "in": "query",
              "description": "Ethiopian month to filter by (1-13)",
              "schema": {
                "example": 3,
                "type": "number"
              }
            },
            {
              "name": "ethiopianDay",
              "required": false,
              "in": "query",
              "description": "Ethiopian day to filter by",
              "schema": {
                "example": 15,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Search term for endpoint or user agent",
              "schema": {
                "example": "outgoing-letters",
                "type": "string"
              }
            },
            {
              "name": "httpMethod",
              "required": false,
              "in": "query",
              "description": "HTTP method to filter by",
              "schema": {
                "enum": [
                  "GET",
                  "POST",
                  "PATCH",
                  "PUT",
                  "DELETE"
                ],
                "type": "string"
              }
            },
            {
              "name": "select",
              "required": false,
              "in": "query",
              "description": "Comma-separated list of fields to return",
              "schema": {
                "example": "auditId,modelName,action,createdAt",
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved audit records",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuditPaginationResponseDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - Invalid query parameters"
            },
            "403": {
              "description": "Forbidden - Insufficient permissions"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve all audit records with filtering and pagination",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/audit/statistics": {
        "get": {
          "description": "\n    Provides aggregated statistics about audit records including:\n    - Action distribution (CREATE, UPDATE, DELETE counts)\n    - Model activity (which models are most modified)\n    - User activity (top users by action count)\n    - Total record count\n    \n    Useful for dashboards and reporting.\n    ",
          "operationId": "AuditController_getStatistics",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "modelName",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved audit statistics"
            },
            "403": {
              "description": "Forbidden - Insufficient permissions"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get audit trail statistics",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/audit/record/{modelName}/{recordId}": {
        "get": {
          "description": "\n    Retrieves the full audit trail for a single record across all actions.\n    Useful for:\n    - Viewing document change history\n    - Tracking letter modifications\n    - Compliance and regulatory requirements\n    ",
          "operationId": "AuditController_getRecordHistory",
          "parameters": [
            {
              "name": "modelName",
              "required": true,
              "in": "path",
              "description": "Name of the model (e.g., OutgoingLetter, Document)",
              "schema": {
                "example": "OutgoingLetter",
                "type": "string"
              }
            },
            {
              "name": "recordId",
              "required": true,
              "in": "path",
              "description": "UUID of the specific record",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "cursor",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "schema": {
                "example": 50,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved record audit history",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuditPaginationResponseDto"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Model or record does not exist"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get complete audit history for a specific record",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/audit/my-activity": {
        "get": {
          "description": "\n    Retrieves audit trail of actions performed by the currently authenticated user.\n    Useful for:\n    - Personal activity logs\n    - Self-service compliance checks\n    - User accountability\n    ",
          "operationId": "AuditController_getMyActivity",
          "parameters": [
            {
              "name": "cursor",
              "required": false,
              "in": "query",
              "description": "Cursor for pagination (audit ID)",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "description": "Number of records to return",
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 50,
                "example": 50,
                "type": "number"
              }
            },
            {
              "name": "modelName",
              "required": false,
              "in": "query",
              "description": "Model name to filter by",
              "schema": {
                "example": "OutgoingLetter",
                "type": "string"
              }
            },
            {
              "name": "recordId",
              "required": false,
              "in": "query",
              "description": "Record ID to filter by",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "action",
              "required": false,
              "in": "query",
              "description": "Action type to filter by",
              "schema": {
                "example": "UPDATE",
                "type": "string",
                "enum": [
                  "CREATE",
                  "UPDATE",
                  "DELETE",
                  "READ",
                  "EXPORT",
                  "FORWARD",
                  "ESCALATE",
                  "DISPATCH",
                  "RETURN",
                  "RECALL",
                  "APPROVE",
                  "REJECT",
                  "TRANSFER",
                  "ACCEPT",
                  "REPLY",
                  "ASSIGN",
                  "COMPLETE",
                  "RECEIVE",
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "VERIFIED",
                  "EXPIRED",
                  "PENDING",
                  "REJECTED_BY_APPROVER",
                  "AUTHORIZED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "User ID who performed the action",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "createdByOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Organization position ID",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-01-01T00:00:00Z",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-12-31T23:59:59Z",
                "type": "string"
              }
            },
            {
              "name": "ethiopianYear",
              "required": false,
              "in": "query",
              "description": "Ethiopian year to filter by",
              "schema": {
                "example": 2017,
                "type": "number"
              }
            },
            {
              "name": "ethiopianMonth",
              "required": false,
              "in": "query",
              "description": "Ethiopian month to filter by (1-13)",
              "schema": {
                "example": 3,
                "type": "number"
              }
            },
            {
              "name": "ethiopianDay",
              "required": false,
              "in": "query",
              "description": "Ethiopian day to filter by",
              "schema": {
                "example": 15,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Search term for endpoint or user agent",
              "schema": {
                "example": "outgoing-letters",
                "type": "string"
              }
            },
            {
              "name": "httpMethod",
              "required": false,
              "in": "query",
              "description": "HTTP method to filter by",
              "schema": {
                "example": "POST",
                "type": "string",
                "enum": [
                  "GET",
                  "POST",
                  "PATCH",
                  "PUT",
                  "DELETE"
                ]
              }
            },
            {
              "name": "select",
              "required": false,
              "in": "query",
              "description": "Fields to include in response (projection)",
              "schema": {
                "example": [
                  "auditId",
                  "modelName",
                  "action",
                  "createdAt"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved user activity",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuditPaginationResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get audit records for the current user",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/audit/organization-activity": {
        "get": {
          "description": "\n    Retrieves audit trail of all actions within the user's organization.\n    Useful for:\n    - Departmental oversight\n    - Team activity monitoring\n    - Organizational compliance\n    ",
          "operationId": "AuditController_getOrganizationActivity",
          "parameters": [
            {
              "name": "cursor",
              "required": false,
              "in": "query",
              "description": "Cursor for pagination (audit ID)",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "description": "Number of records to return",
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 50,
                "example": 50,
                "type": "number"
              }
            },
            {
              "name": "modelName",
              "required": false,
              "in": "query",
              "description": "Model name to filter by",
              "schema": {
                "example": "OutgoingLetter",
                "type": "string"
              }
            },
            {
              "name": "recordId",
              "required": false,
              "in": "query",
              "description": "Record ID to filter by",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "action",
              "required": false,
              "in": "query",
              "description": "Action type to filter by",
              "schema": {
                "example": "UPDATE",
                "type": "string",
                "enum": [
                  "CREATE",
                  "UPDATE",
                  "DELETE",
                  "READ",
                  "EXPORT",
                  "FORWARD",
                  "ESCALATE",
                  "DISPATCH",
                  "RETURN",
                  "RECALL",
                  "APPROVE",
                  "REJECT",
                  "TRANSFER",
                  "ACCEPT",
                  "REPLY",
                  "ASSIGN",
                  "COMPLETE",
                  "RECEIVE",
                  "CREATED",
                  "ESCALATED",
                  "FORWARDED",
                  "RETURNED",
                  "TRANSFERRED",
                  "DISPATCHED",
                  "SIGNED",
                  "APPROVED",
                  "REJECTED",
                  "DELETED",
                  "ARCHIVED",
                  "EDITED",
                  "RECALLED",
                  "FORKED",
                  "VERIFIED",
                  "EXPIRED",
                  "PENDING",
                  "REJECTED_BY_APPROVER",
                  "AUTHORIZED"
                ]
              }
            },
            {
              "name": "createdBy",
              "required": false,
              "in": "query",
              "description": "User ID who performed the action",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "createdByOrganizationPositionId",
              "required": false,
              "in": "query",
              "description": "Organization position ID",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-01-01T00:00:00Z",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for filtering (ISO 8601)",
              "schema": {
                "example": "2024-12-31T23:59:59Z",
                "type": "string"
              }
            },
            {
              "name": "ethiopianYear",
              "required": false,
              "in": "query",
              "description": "Ethiopian year to filter by",
              "schema": {
                "example": 2017,
                "type": "number"
              }
            },
            {
              "name": "ethiopianMonth",
              "required": false,
              "in": "query",
              "description": "Ethiopian month to filter by (1-13)",
              "schema": {
                "example": 3,
                "type": "number"
              }
            },
            {
              "name": "ethiopianDay",
              "required": false,
              "in": "query",
              "description": "Ethiopian day to filter by",
              "schema": {
                "example": 15,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Search term for endpoint or user agent",
              "schema": {
                "example": "outgoing-letters",
                "type": "string"
              }
            },
            {
              "name": "httpMethod",
              "required": false,
              "in": "query",
              "description": "HTTP method to filter by",
              "schema": {
                "example": "POST",
                "type": "string",
                "enum": [
                  "GET",
                  "POST",
                  "PATCH",
                  "PUT",
                  "DELETE"
                ]
              }
            },
            {
              "name": "select",
              "required": false,
              "in": "query",
              "description": "Fields to include in response (projection)",
              "schema": {
                "example": [
                  "auditId",
                  "modelName",
                  "action",
                  "createdAt"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved organization activity",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuditPaginationResponseDto"
                  }
                }
              }
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get audit records for the current user organization",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/audit/{id}": {
        "get": {
          "description": "\n    Fetches detailed information about a specific audit record including:\n    - Full change details (before/after)\n    - User information\n    - Organization position details\n    - Request metadata (IP, user agent, endpoint)\n    - Ethiopian calendar information\n    ",
          "operationId": "AuditController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "The UUID of the audit record",
              "schema": {
                "example": "123e4567-e89b-12d3-a456-426614174000",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved audit record",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuditResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Insufficient permissions"
            },
            "404": {
              "description": "Not Found - Audit record does not exist"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Retrieve a single audit record by ID",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/office-api/archive": {
        "get": {
          "description": "Retrieve paginated list of archived incoming letters, outgoing letters, memos, and documents",
          "operationId": "ArchiveController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Filter by archive type",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "INCOMING_LETTER",
                  "OUTGOING_LETTER",
                  "MEMO",
                  "DOCUMENT"
                ]
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Search across subjects/titles, reference numbers, tracking numbers, and document category names",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Filter by start date",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "Filter by end date",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by document category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Page number for pagination",
              "required": false,
              "name": "page",
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "description": "Number of items per page",
              "required": false,
              "name": "limit",
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "description": "Filter by archive type",
              "required": false,
              "name": "type",
              "in": "query",
              "schema": {
                "default": "ALL",
                "type": "string"
              }
            },
            {
              "description": "Search across subjects/titles, reference numbers, tracking numbers, and document category names",
              "required": false,
              "name": "search",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by start date",
              "required": false,
              "name": "startDate",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by end date",
              "required": false,
              "name": "endDate",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "description": "Filter by document category ID",
              "required": false,
              "name": "documentCategoryId",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved archived items"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get all archived items",
          "tags": [
            "Archive"
          ]
        }
      },
      "/office-api/archive/{id}": {
        "get": {
          "description": "Retrieve detailed information of a specific archived item by ID and type",
          "operationId": "ArchiveController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "ID of the archived item",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "type",
              "required": true,
              "in": "query",
              "description": "Type of archived item",
              "schema": {
                "type": "string",
                "enum": [
                  "INCOMING_LETTER",
                  "OUTGOING_LETTER",
                  "MEMO",
                  "DOCUMENT"
                ]
              }
            },
            {
              "description": "Type of archived item",
              "required": true,
              "name": "type",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved archived item detail"
            },
            "404": {
              "description": "Archived item not found"
            }
          },
          "security": [
            {
              "accessToken": []
            }
          ],
          "summary": "Get archived item detail",
          "tags": [
            "Archive"
          ]
        }
      },
      "/office-api/reporting/users": {
        "get": {
          "operationId": "ReportingController_getUsersReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "description": "Filter by department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "positionId",
              "required": false,
              "in": "query",
              "description": "Filter by position ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "description": "Filter by user status (active/inactive)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "includeChildOrganizations",
              "required": false,
              "in": "query",
              "description": "Include users from child organizations",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns users data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate System Users Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/incoming-letters": {
        "get": {
          "operationId": "ReportingController_getIncomingLettersReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by source organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "recipientOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by recipient organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by confidentiality ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "workflowView",
              "required": false,
              "in": "query",
              "description": "ALL shows every workflow step. LATEST shows only the most recent step per recipient (parallel forwards are shown separately).",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "LATEST"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns incoming letters data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Incoming Letters Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/outgoing-letters": {
        "get": {
          "operationId": "ReportingController_getOutgoingLettersReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by source organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "recipientOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by recipient organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by confidentiality ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "workflowView",
              "required": false,
              "in": "query",
              "description": "ALL shows every workflow step. LATEST shows only the most recent step per recipient (parallel forwards are shown separately).",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "LATEST"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns outgoing letters data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Outgoing Letters Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/memos": {
        "get": {
          "operationId": "ReportingController_getMemoReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by source organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "recipientOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by recipient organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by confidentiality ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "workflowView",
              "required": false,
              "in": "query",
              "description": "ALL shows every workflow step. LATEST shows only the most recent step per recipient (parallel forwards are shown separately).",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "LATEST"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns memo data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Memo Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/assignments": {
        "get": {
          "operationId": "ReportingController_getAssignmentsReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "assignedToUserId",
              "required": false,
              "in": "query",
              "description": "Filter by user ID the task is assigned to",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "assignedByUserId",
              "required": false,
              "in": "query",
              "description": "Filter by user ID who assigned the task",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "taskStatus",
              "required": false,
              "in": "query",
              "description": "Filter by task completion status (true=completed, false=pending)",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "isOnProgress",
              "required": false,
              "in": "query",
              "description": "Filter by in-progress status",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns assignments data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Assignments Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/dispatching-letters": {
        "get": {
          "operationId": "ReportingController_getDispatchingLettersReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by source organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "recipientOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by recipient organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "priorityId",
              "required": false,
              "in": "query",
              "description": "Filter by priority ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "confidentialityId",
              "required": false,
              "in": "query",
              "description": "Filter by confidentiality ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "workflowView",
              "required": false,
              "in": "query",
              "description": "ALL shows every workflow step. LATEST shows only the most recent step per recipient (parallel forwards are shown separately).",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "LATEST"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns dispatching letters data or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Dispatching Letters Report",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/documents": {
        "get": {
          "operationId": "ReportingController_getDocumentsReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "documentCategoryId",
              "required": false,
              "in": "query",
              "description": "Filter by document category ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sourceOrganizationId",
              "required": false,
              "in": "query",
              "description": "Filter by source organization ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "retentionStatus",
              "required": false,
              "in": "query",
              "description": "Filter documents by retention status. ACTIVE = not yet expired. DISPOSABLE = past retention period.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "ACTIVE",
                  "DISPOSABLE"
                ]
              }
            },
            {
              "name": "isArchived",
              "required": false,
              "in": "query",
              "description": "Filter by archived status",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns documents with retention status (Active/Disposable) or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Documents Report with Retention Status",
          "tags": [
            "Reporting"
          ]
        }
      },
      "/office-api/reporting/disposable-documents": {
        "get": {
          "operationId": "ReportingController_getDisposableDocumentsReport",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "description": "Start date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-01-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "End date for CUSTOM period filter (ISO format)",
              "schema": {
                "example": "2024-12-31",
                "type": "string"
              }
            },
            {
              "name": "period",
              "required": false,
              "in": "query",
              "description": "Time period filter. ALL returns all records without date filtering.",
              "schema": {
                "default": "ALL",
                "type": "string",
                "enum": [
                  "ALL",
                  "WEEKLY",
                  "MONTHLY",
                  "QUARTERLY",
                  "YEARLY",
                  "CUSTOM"
                ]
              }
            },
            {
              "name": "format",
              "required": false,
              "in": "query",
              "description": "Output format. EXCEL downloads an .xlsx file.",
              "schema": {
                "default": "JSON",
                "type": "string",
                "enum": [
                  "JSON",
                  "EXCEL"
                ]
              }
            },
            {
              "name": "organizationId",
              "required": false,
              "in": "query",
              "description": "Filter by organization/department ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns documents past their retention period or downloads Excel file"
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate Disposable Documents Report",
          "tags": [
            "Reporting"
          ]
        }
      }
    },
    "info": {
      "title": "MILLS Documentation",
      "description": "The MILLS API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "MILLS",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "securitySchemes": {
        "cookie": {
          "type": "apiKey",
          "in": "cookie",
          "name": "access_token"
        }
      },
      "schemas": {
        "SignInDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "The user's email address.",
              "example": "admin@mofa.gov.et"
            },
            "password": {
              "type": "string",
              "description": "The user's password.",
              "example": "adminPassword"
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "ForgotPasswordDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email address to send password reset link",
              "example": "user@example.com"
            }
          },
          "required": [
            "email"
          ]
        },
        "ResetPasswordDto": {
          "type": "object",
          "properties": {
            "token": {
              "type": "string",
              "description": "Password reset token sent to user email"
            },
            "newPassword": {
              "type": "string",
              "description": "New password with minimum length of 8 characters"
            }
          },
          "required": [
            "token",
            "newPassword"
          ]
        },
        "ChangePasswordDto": {
          "type": "object",
          "properties": {
            "oldPassword": {
              "type": "string",
              "description": "Current password of the user"
            },
            "newPassword": {
              "type": "string",
              "description": "New password to set, minimum length 8"
            }
          },
          "required": [
            "oldPassword",
            "newPassword"
          ]
        },
        "PublicRegistrationDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "description": "The unique username for the user.",
              "example": "john.doe"
            },
            "password": {
              "type": "string",
              "description": "The user's password.",
              "example": "SecureP@ssw0rd123"
            },
            "email": {
              "type": "string",
              "description": "The user's email address.",
              "example": "john.doe@example.com"
            },
            "fullName": {
              "type": "string",
              "description": "The user's full name.",
              "example": "John Doe"
            },
            "registrationType": {
              "type": "string",
              "description": "Registration type - individual or organization",
              "enum": [
                "INDIVIDUAL",
                "ORGANIZATION"
              ],
              "example": "INDIVIDUAL"
            },
            "phoneNumber": {
              "type": "string",
              "description": "The user's phone number.",
              "example": "+251911123456"
            },
            "location": {
              "type": "string",
              "description": "The user's location/address.",
              "example": "Addis Ababa, Ethiopia"
            },
            "identificationNumber": {
              "type": "string",
              "description": "Fayida ID number (for Ethiopian citizens) or Passport.",
              "example": "FAY123456789"
            },
            "organizationName": {
              "type": "string",
              "description": "Organization name (required for organization registration).",
              "example": "ABC Company Ltd."
            },
            "organizationType": {
              "type": "string",
              "description": "Organization type .",
              "example": "Private"
            },
            "organizationAddress": {
              "type": "string",
              "description": "Organization address (required for organization registration).",
              "example": "123 Business Street, Addis Ababa"
            },
            "letterAttachment": {
              "type": "string",
              "format": "binary",
              "description": "Organization letter attachment (required for organization registration)."
            }
          },
          "required": [
            "username",
            "password",
            "email",
            "fullName",
            "registrationType",
            "phoneNumber",
            "location"
          ]
        },
        "OrganizationResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "organizationId": {
              "type": "string",
              "description": "The unique identifier of the organization.",
              "format": "uuid"
            },
            "organizationName": {
              "type": "string",
              "description": "The name of the organization."
            },
            "organizationNameTranslations": {
              "type": "object",
              "description": "Translations for organization name",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              }
            },
            "address": {
              "type": "string",
              "description": "The physical address of the organization."
            },
            "addressTranslations": {
              "type": "object",
              "description": "Translations for address",
              "example": {
                "en": "Addis Ababa, Ethiopia",
                "am": "አዲስ አበባ፣ ኢትዮጵያ"
              }
            },
            "organizationTitterName": {
              "type": "string",
              "description": "The Titter name for the organization."
            },
            "organizationTitterNameTranslations": {
              "type": "object",
              "description": "Translations for organization Titter name",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              }
            },
            "contactEmail": {
              "type": "string",
              "description": "The contact email of the organization."
            },
            "contactPhone": {
              "type": "string",
              "description": "The contact phone number of the organization."
            },
            "parentOrganizationId": {
              "type": "string",
              "description": "The ID of the parent organization (if any).",
              "format": "uuid",
              "nullable": true
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the organization is active."
            },
            "isRecordOffice": {
              "type": "boolean",
              "description": "Indicates if the organization is a record office."
            },
            "isEmbassy": {
              "type": "boolean",
              "description": "Indicates if the organization is an embassy."
            }
          },
          "required": [
            "organizationId",
            "organizationName",
            "address",
            "contactEmail",
            "contactPhone",
            "parentOrganizationId",
            "isActive",
            "isRecordOffice",
            "isEmbassy"
          ]
        },
        "PositionResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "positionId": {
              "type": "string",
              "description": "The unique identifier of the position.",
              "format": "uuid"
            },
            "positionName": {
              "type": "string",
              "description": "The name of the position."
            },
            "positionNameTranslations": {
              "type": "object",
              "description": "Translations for position name",
              "example": {
                "en": "Director",
                "am": "ዳይሬክተር"
              }
            },
            "description": {
              "type": "string",
              "description": "A description of the position.",
              "nullable": true
            },
            "level": {
              "type": "number",
              "description": "The hierarchy level of the position (supports decimals like 1.5, 2.5).",
              "nullable": true
            },
            "isMany": {
              "type": "boolean",
              "description": "Whether this position allows multiple users (true) or single user only (false).",
              "default": false
            }
          },
          "required": [
            "positionId",
            "positionName",
            "description",
            "level",
            "isMany"
          ]
        },
        "OrganizationPositionResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The unique identifier for the organization-position assignment.",
              "format": "uuid"
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization.",
              "format": "uuid"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position.",
              "format": "uuid"
            },
            "organization": {
              "description": "The associated organization details.",
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationResponseDto"
                }
              ]
            },
            "position": {
              "description": "The associated position details.",
              "allOf": [
                {
                  "$ref": "#/components/schemas/PositionResponseDto"
                }
              ]
            },
            "canCreateOutgoing": {
              "type": "boolean",
              "description": "Permission to create outgoing letters."
            },
            "canEscalateOutgoing": {
              "type": "boolean",
              "description": "Permission to escalate outgoing letters."
            },
            "canForwardOutgoing": {
              "type": "boolean",
              "description": "Permission to forward outgoing letters."
            },
            "canDispatchOutgoing": {
              "type": "boolean",
              "description": "Permission to dispatch outgoing letters."
            },
            "canReturnOutgoing": {
              "type": "boolean",
              "description": "Permission to return outgoing letters."
            },
            "canTransferOutgoing": {
              "type": "boolean",
              "description": "Permission to transfer outgoing letters."
            },
            "canReturnIncoming": {
              "type": "boolean",
              "description": "Permission to return incoming letters."
            },
            "canAcceptIncoming": {
              "type": "boolean",
              "description": "Permission to accept incoming letters."
            },
            "canReplyIncoming": {
              "type": "boolean",
              "description": "Permission to reply to incoming letters."
            },
            "canForwardIncoming": {
              "type": "boolean",
              "description": "Permission to forward incoming letters."
            },
            "canTransferIncoming": {
              "type": "boolean",
              "description": "Permission to transfer incoming letters."
            },
            "canForwardToRecordOffice": {
              "type": "boolean",
              "description": "Permission to forward to outgoing record office letters."
            },
            "canViewForwardedOutgoing": {
              "type": "boolean",
              "description": "Permission to can view forwarded outgoing letters."
            },
            "canViewEscalatedOutgoing": {
              "type": "boolean",
              "description": "Permission to can view escalated outgoing letters."
            },
            "canViewDispatchedOutgoing": {
              "type": "boolean",
              "description": "Permission to can view dispatched letters."
            },
            "canCreateJobAssignment": {
              "type": "boolean",
              "description": "Permission to can Create Job Assignment."
            },
            "canViewJobAssignment": {
              "type": "boolean",
              "description": "Permission to can View Job Assignment."
            },
            "canDeleteJobAssignment": {
              "type": "boolean",
              "description": "Permission to can Delete Job Assignment."
            },
            "canViewOutgoing": {
              "type": "boolean",
              "description": "Permission to can View Outgoing Letters."
            },
            "canViewRecordOffices": {
              "type": "boolean",
              "description": "Permission to can View Record Offices."
            },
            "canViewReport": {
              "type": "boolean",
              "description": "Permission to view reports."
            }
          },
          "required": [
            "organizationPositionId",
            "organizationId",
            "positionId",
            "organization",
            "position",
            "canCreateOutgoing",
            "canEscalateOutgoing",
            "canForwardOutgoing",
            "canDispatchOutgoing",
            "canReturnOutgoing",
            "canTransferOutgoing",
            "canReturnIncoming",
            "canAcceptIncoming",
            "canReplyIncoming",
            "canForwardIncoming",
            "canTransferIncoming",
            "canForwardToRecordOffice",
            "canViewForwardedOutgoing",
            "canViewEscalatedOutgoing",
            "canViewDispatchedOutgoing",
            "canCreateJobAssignment",
            "canViewJobAssignment",
            "canDeleteJobAssignment",
            "canViewOutgoing",
            "canViewRecordOffices",
            "canViewReport"
          ]
        },
        "SourceOrganizationResponseDto": {
          "type": "object",
          "properties": {
            "SourceOrganizationID": {
              "type": "string",
              "description": "ID of the source organization.",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "sourceOrganizationName": {
              "type": "string",
              "description": "Name of the source organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "sourceOrganizationNameTranslations": {
              "type": "object",
              "description": "Translations for source organization name",
              "example": {
                "en": "United Nations",
                "am": "የተባበሩት መንግስታት ድርጅት"
              }
            },
            "sourceOrganizationType": {
              "type": "string",
              "description": "Type of the source organization.",
              "enum": [
                "Government",
                "NGO",
                "Private",
                "International"
              ],
              "example": "Government"
            },
            "address": {
              "type": "string",
              "description": "Address of the source organization.",
              "example": "123 Main St, City"
            },
            "addressTranslations": {
              "type": "object",
              "description": "Translations for address",
              "example": {
                "en": "New York, USA",
                "am": "ኒው ዮርክ፣ አሜሪካ"
              }
            },
            "contactPerson": {
              "type": "string",
              "description": "Contact person at the source organization.",
              "example": "John Doe"
            },
            "contactEmail": {
              "type": "string",
              "description": "Contact email of the source organization.",
              "example": "contact@organization.gov"
            },
            "contactPhone": {
              "type": "string",
              "description": "Contact phone number of the source organization.",
              "example": "+1234567890"
            }
          },
          "required": [
            "SourceOrganizationID",
            "sourceOrganizationName",
            "sourceOrganizationType",
            "address"
          ]
        },
        "UserResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "userId": {
              "type": "string",
              "description": "The unique identifier of the user.",
              "format": "uuid"
            },
            "username": {
              "type": "string",
              "description": "The unique username for the user."
            },
            "email": {
              "type": "string",
              "description": "The user's email address."
            },
            "fullName": {
              "type": "string",
              "description": "The user's first name."
            },
            "fullNameTranslations": {
              "type": "object",
              "description": "Translations for user full name",
              "example": {
                "en": "John Doe",
                "am": "ጆን ዶ"
              }
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization the user belongs to.",
              "format": "uuid",
              "nullable": true
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the user account is active."
            },
            "isSecretary": {
              "type": "boolean",
              "description": "Indicates if the user account is secretary."
            },
            "lastLogin": {
              "type": "string",
              "description": "Timestamp of the user's last successful login.",
              "format": "date-time",
              "nullable": true
            },
            "signatureUploadedAt": {
              "type": "string",
              "description": "the time user upload or update his signature.",
              "format": "date-time",
              "nullable": true
            },
            "isEmailVerified": {
              "type": "boolean",
              "description": "Indicates if the user's email address has been verified."
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The ID of the specific organization position the user holds.",
              "format": "uuid",
              "nullable": true
            },
            "delegatedBy": {
              "type": "string",
              "description": "The ID of the user who delegated to this user.",
              "format": "uuid",
              "nullable": true
            },
            "userType": {
              "type": "string",
              "description": "The type of user - INSIDER for internal staff, OUTSIDER for public registrants.",
              "enum": [
                "INSIDER",
                "OUTSIDER"
              ],
              "nullable": true
            },
            "organization": {
              "description": "The associated organization details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationResponseDto"
                }
              ]
            },
            "organizationPosition": {
              "description": "The associated organization position details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                }
              ]
            },
            "signaturePath": {
              "type": "string",
              "description": "signature file path.",
              "nullable": true
            },
            "sourceOrganization": {
              "description": "The associated source organization details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                }
              ]
            }
          },
          "required": [
            "userId",
            "username",
            "email",
            "fullName",
            "organizationId",
            "isActive",
            "isSecretary",
            "lastLogin",
            "signatureUploadedAt",
            "isEmailVerified",
            "organizationPositionId",
            "delegatedBy",
            "userType",
            "organization",
            "organizationPosition",
            "signaturePath",
            "sourceOrganization"
          ]
        },
        "AuthResponseDto": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string",
              "description": "The JWT access token for authenticated requests.",
              "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            "user": {
              "description": "Details of the authenticated user.",
              "allOf": [
                {
                  "$ref": "#/components/schemas/UserResponseDto"
                }
              ]
            },
            "refeshToken": {
              "type": "string",
              "description": "The JWT refersh token for authenticated requests.",
              "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
          },
          "required": [
            "accessToken",
            "user",
            "refeshToken"
          ]
        },
        "PendingRegistrationResponseDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "fullName": {
              "type": "string"
            },
            "registrationType": {
              "type": "string",
              "enum": [
                "INDIVIDUAL",
                "ORGANIZATION"
              ]
            },
            "phoneNumber": {
              "type": "string"
            },
            "location": {
              "type": "string"
            },
            "identificationNumber": {
              "type": "string"
            },
            "organizationName": {
              "type": "string"
            },
            "organizationType": {
              "type": "string"
            },
            "organizationAddress": {
              "type": "string"
            },
            "organizationLetterPath": {
              "type": "string"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "userId",
            "username",
            "email",
            "fullName",
            "registrationType",
            "phoneNumber",
            "location",
            "createdAt"
          ]
        },
        "RegistrationDetailResponseDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "fullName": {
              "type": "string"
            },
            "registrationType": {
              "type": "string",
              "enum": [
                "INDIVIDUAL",
                "ORGANIZATION"
              ]
            },
            "phoneNumber": {
              "type": "string"
            },
            "location": {
              "type": "string"
            },
            "identificationNumber": {
              "type": "string"
            },
            "organizationName": {
              "type": "string"
            },
            "organizationType": {
              "type": "string"
            },
            "organizationAddress": {
              "type": "string"
            },
            "organizationLetterPath": {
              "type": "string"
            },
            "registrationStatus": {
              "type": "string"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string"
            },
            "rejectionReason": {
              "type": "string"
            },
            "approvedBy": {
              "type": "string"
            },
            "approvedAt": {
              "format": "date-time",
              "type": "string"
            },
            "rejectedBy": {
              "type": "string"
            },
            "rejectedAt": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "userId",
            "username",
            "email",
            "fullName",
            "registrationType",
            "phoneNumber",
            "location",
            "registrationStatus",
            "createdAt"
          ]
        },
        "VerifyRegistrationDto": {
          "type": "object",
          "properties": {
            "action": {
              "type": "string",
              "description": "Action to take on the registration.",
              "enum": [
                "APPROVE",
                "REJECT"
              ],
              "example": "APPROVE"
            },
            "rejectionReason": {
              "type": "string",
              "description": "Reason for rejection (required if action is REJECT).",
              "example": "Invalid organization letter or insufficient documentation."
            }
          },
          "required": [
            "action"
          ]
        },
        "TranslationDto": {
          "type": "object",
          "properties": {
            "en": {
              "type": "string",
              "description": "English translation",
              "example": "Director"
            },
            "am": {
              "type": "string",
              "description": "Amharic translation",
              "example": "ዳይሬክተር"
            }
          }
        },
        "CreateSourceOrganizationDto": {
          "type": "object",
          "properties": {
            "sourceOrganizationName": {
              "type": "string",
              "description": "Name of the source organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "sourceOrganizationNameTranslations": {
              "description": "Translations for source organization name in different languages",
              "example": {
                "en": "United Nations",
                "am": "የተባበሩት መንግስታት ድርጅት"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "sourceOrganizationType": {
              "type": "string",
              "description": "Type of the source organization.",
              "enum": [
                "Government",
                "NGO",
                "Private",
                "International"
              ],
              "default": "Government"
            },
            "address": {
              "type": "string",
              "description": "Address of the source organization.",
              "example": "123 Main St, City"
            },
            "addressTranslations": {
              "description": "Translations for address in different languages",
              "example": {
                "en": "New York, USA",
                "am": "ኒው ዮርክ፣ አሜሪካ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "contactPerson": {
              "type": "string",
              "description": "Contact person at the source organization.",
              "example": "John Doe"
            },
            "contactEmail": {
              "type": "string",
              "description": "Contact email of the source organization.",
              "example": "contact@organization.gov"
            },
            "contactPhone": {
              "type": "string",
              "description": "Contact phone number of the source organization.",
              "example": "+1234567890"
            }
          },
          "required": [
            "sourceOrganizationName",
            "sourceOrganizationType",
            "address",
            "contactPerson",
            "contactEmail",
            "contactPhone"
          ]
        },
        "UpdateSourceOrganizationDto": {
          "type": "object",
          "properties": {
            "sourceOrganizationName": {
              "type": "string",
              "description": "Name of the source organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "sourceOrganizationNameTranslations": {
              "description": "Translations for source organization name in different languages",
              "example": {
                "en": "United Nations",
                "am": "የተባበሩት መንግስታት ድርጅት"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "sourceOrganizationType": {
              "type": "string",
              "description": "Type of the source organization.",
              "enum": [
                "Government",
                "NGO",
                "Private",
                "International"
              ],
              "default": "Government"
            },
            "address": {
              "type": "string",
              "description": "Address of the source organization.",
              "example": "123 Main St, City"
            },
            "addressTranslations": {
              "description": "Translations for address in different languages",
              "example": {
                "en": "New York, USA",
                "am": "ኒው ዮርክ፣ አሜሪካ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "contactPerson": {
              "type": "string",
              "description": "Contact person at the source organization.",
              "example": "John Doe"
            },
            "contactEmail": {
              "type": "string",
              "description": "Contact email of the source organization.",
              "example": "contact@organization.gov"
            },
            "contactPhone": {
              "type": "string",
              "description": "Contact phone number of the source organization.",
              "example": "+1234567890"
            },
            "sourceOrganizationID": {
              "type": "string",
              "description": "ID of the source organization.",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "sourceOrganizationID"
          ]
        },
        "CreateUserDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "description": "The unique username for the user.",
              "example": "john.doe"
            },
            "email": {
              "type": "string",
              "description": "The user's email address.",
              "example": "john.doe@example.com"
            },
            "fullName": {
              "type": "string",
              "description": "The user's first name.",
              "example": "John"
            },
            "fullNameTranslations": {
              "description": "Translations for user full name in different languages",
              "example": {
                "en": "John Doe",
                "am": "ጆን ዶ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization the user belongs to.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position the user holds.",
              "format": "uuid",
              "example": "987e6543-e21b-12d3-a456-426614174000"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the user account is active.",
              "example": true
            },
            "isSecretary": {
              "type": "boolean",
              "description": "Indicate the   user  is Secretary.",
              "example": true
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The ID of the specific organization position the user holds.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "username",
            "email",
            "fullName"
          ]
        },
        "UserWorkloadResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "userId": {
              "type": "string",
              "description": "The unique identifier of the user.",
              "format": "uuid"
            },
            "username": {
              "type": "string",
              "description": "The unique username for the user."
            },
            "email": {
              "type": "string",
              "description": "The user's email address."
            },
            "fullName": {
              "type": "string",
              "description": "The user's first name."
            },
            "fullNameTranslations": {
              "type": "object",
              "description": "Translations for user full name",
              "example": {
                "en": "John Doe",
                "am": "ጆን ዶ"
              }
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization the user belongs to.",
              "format": "uuid",
              "nullable": true
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the user account is active."
            },
            "isSecretary": {
              "type": "boolean",
              "description": "Indicates if the user account is secretary."
            },
            "lastLogin": {
              "type": "string",
              "description": "Timestamp of the user's last successful login.",
              "format": "date-time",
              "nullable": true
            },
            "signatureUploadedAt": {
              "type": "string",
              "description": "the time user upload or update his signature.",
              "format": "date-time",
              "nullable": true
            },
            "isEmailVerified": {
              "type": "boolean",
              "description": "Indicates if the user's email address has been verified."
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The ID of the specific organization position the user holds.",
              "format": "uuid",
              "nullable": true
            },
            "delegatedBy": {
              "type": "string",
              "description": "The ID of the user who delegated to this user.",
              "format": "uuid",
              "nullable": true
            },
            "userType": {
              "type": "string",
              "description": "The type of user - INSIDER for internal staff, OUTSIDER for public registrants.",
              "enum": [
                "INSIDER",
                "OUTSIDER"
              ],
              "nullable": true
            },
            "organization": {
              "description": "The associated organization details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationResponseDto"
                }
              ]
            },
            "organizationPosition": {
              "description": "The associated organization position details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationPositionResponseDto"
                }
              ]
            },
            "signaturePath": {
              "type": "string",
              "description": "signature file path.",
              "nullable": true
            },
            "sourceOrganization": {
              "description": "The associated source organization details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/SourceOrganizationResponseDto"
                }
              ]
            },
            "unfinishedJobCount": {
              "type": "number",
              "description": "The number of unfinished (not completed) jobs assigned to the user.",
              "example": 5
            }
          },
          "required": [
            "userId",
            "username",
            "email",
            "fullName",
            "organizationId",
            "isActive",
            "isSecretary",
            "lastLogin",
            "signatureUploadedAt",
            "isEmailVerified",
            "organizationPositionId",
            "delegatedBy",
            "userType",
            "organization",
            "organizationPosition",
            "signaturePath",
            "sourceOrganization",
            "unfinishedJobCount"
          ]
        },
        "UpdateUserDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "description": "The unique username for the user.",
              "example": "john.doe"
            },
            "email": {
              "type": "string",
              "description": "The user's email address.",
              "example": "john.doe@example.com"
            },
            "fullName": {
              "type": "string",
              "description": "The user's first name.",
              "example": "John"
            },
            "fullNameTranslations": {
              "description": "Translations for user full name in different languages",
              "example": {
                "en": "John Doe",
                "am": "ጆን ዶ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization the user belongs to.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position the user holds.",
              "format": "uuid",
              "example": "987e6543-e21b-12d3-a456-426614174000"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the user account is active.",
              "example": true
            },
            "isSecretary": {
              "type": "boolean",
              "description": "Indicate the   user  is Secretary.",
              "example": true
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The ID of the specific organization position the user holds.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "delegatedBy": {
              "type": "string",
              "description": "The ID of the user who delegated to this user (for delegation scenarios).",
              "format": "uuid",
              "example": "f8e7d6c5-b4a3-2109-8765-43210fedcba9"
            },
            "password": {
              "type": "string",
              "description": "The user's password.",
              "example": "SecureP@ssw0rd123"
            }
          },
          "required": [
            "password"
          ]
        },
        "PermissionResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "permissionId": {
              "type": "string",
              "description": "The unique identifier of the permission.",
              "format": "uuid"
            },
            "permissionName": {
              "type": "string",
              "description": "The name of the permission."
            },
            "description": {
              "type": "string",
              "description": "A description of the permission.",
              "nullable": true
            }
          },
          "required": [
            "permissionId",
            "permissionName",
            "description"
          ]
        },
        "RoleResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "roleId": {
              "type": "string",
              "description": "The unique identifier of the role.",
              "format": "uuid"
            },
            "roleName": {
              "type": "string",
              "description": "The name of the role."
            },
            "description": {
              "type": "string",
              "description": "A description of the role.",
              "nullable": true
            },
            "permissions": {
              "description": "A list of permissions associated with this role.",
              "nullable": true,
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/PermissionResponseDto"
              }
            }
          },
          "required": [
            "roleId",
            "roleName",
            "description",
            "permissions"
          ]
        },
        "UserDetailsResponse": {
          "type": "object",
          "properties": {
            "position": {
              "description": "The user's assigned position, if any.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/PositionResponseDto"
                }
              ]
            },
            "roles": {
              "description": "A list of roles assigned to the user.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/RoleResponseDto"
              }
            },
            "permissions": {
              "description": "A consolidated list of unique permissions granted to the user through their roles.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/PermissionResponseDto"
              }
            }
          },
          "required": [
            "position",
            "roles",
            "permissions"
          ]
        },
        "CreateOrganizationDto": {
          "type": "object",
          "properties": {
            "organizationName": {
              "type": "string",
              "description": "The name of the organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "organizationNameTranslations": {
              "description": "Translations for organization name in different languages",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "organizationTitterName": {
              "type": "string",
              "description": "The Titter name for the organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "organizationTitterNameTranslations": {
              "description": "Translations for organization Titter name in different languages",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "address": {
              "type": "string",
              "description": "The physical address of the organization.",
              "example": "Addis Ababa, Ethiopia"
            },
            "addressTranslations": {
              "description": "Translations for address in different languages",
              "example": {
                "en": "Addis Ababa, Ethiopia",
                "am": "አዲስ አበባ፣ ኢትዮጵያ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "contactEmail": {
              "type": "string",
              "description": "The contact email of the organization.",
              "example": "info@mofa.gov.et"
            },
            "contactPhone": {
              "type": "string",
              "description": "The contact phone number of the organization.",
              "example": "+251912345678"
            },
            "parentOrganizationId": {
              "type": "string",
              "description": "The ID of the parent organization (for branches/embassies).",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "isRecordOffice": {
              "type": "boolean",
              "description": "Designates if the organization is a record office.",
              "example": false,
              "default": false
            },
            "isEmbassy": {
              "type": "boolean",
              "description": "Designates if the organization is an embassy.",
              "example": false,
              "default": false
            }
          },
          "required": [
            "organizationName",
            "organizationTitterName",
            "address",
            "contactEmail",
            "contactPhone"
          ]
        },
        "UpdateOrganizationDto": {
          "type": "object",
          "properties": {
            "organizationName": {
              "type": "string",
              "description": "The name of the organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "organizationNameTranslations": {
              "description": "Translations for organization name in different languages",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "organizationTitterName": {
              "type": "string",
              "description": "The Titter name for the organization.",
              "example": "Ministry of Foreign Affairs"
            },
            "organizationTitterNameTranslations": {
              "description": "Translations for organization Titter name in different languages",
              "example": {
                "en": "Ministry of Foreign Affairs",
                "am": "የውጭ ጉዳይ ሚኒስቴር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "address": {
              "type": "string",
              "description": "The physical address of the organization.",
              "example": "Addis Ababa, Ethiopia"
            },
            "addressTranslations": {
              "description": "Translations for address in different languages",
              "example": {
                "en": "Addis Ababa, Ethiopia",
                "am": "አዲስ አበባ፣ ኢትዮጵያ"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "contactEmail": {
              "type": "string",
              "description": "The contact email of the organization.",
              "example": "info@mofa.gov.et"
            },
            "contactPhone": {
              "type": "string",
              "description": "The contact phone number of the organization.",
              "example": "+251912345678"
            },
            "parentOrganizationId": {
              "type": "string",
              "description": "The ID of the parent organization (for branches/embassies).",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "isRecordOffice": {
              "type": "boolean",
              "description": "Designates if the organization is a record office.",
              "example": false,
              "default": false
            },
            "isEmbassy": {
              "type": "boolean",
              "description": "Designates if the organization is an embassy.",
              "example": false,
              "default": false
            }
          }
        },
        "CreatePositionDto": {
          "type": "object",
          "properties": {
            "positionName": {
              "type": "string",
              "description": "The name of the position.",
              "example": "Ambassador"
            },
            "positionNameTranslations": {
              "description": "Translations for position name in different languages",
              "example": {
                "en": "Ambassador",
                "am": "አምባሳደር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "description": {
              "type": "string",
              "description": "A description of the position.",
              "example": "Represents the country in a foreign nation."
            },
            "level": {
              "type": "number",
              "description": "The hierarchy level of the position (supports decimals like 1.5, 2.5).",
              "example": 1.5
            },
            "isMany": {
              "type": "boolean",
              "description": "Whether this position allows multiple users (true) or single user only (false).",
              "example": false,
              "default": false
            }
          },
          "required": [
            "positionName"
          ]
        },
        "UpdatePositionDto": {
          "type": "object",
          "properties": {
            "positionName": {
              "type": "string",
              "description": "The name of the position.",
              "example": "Ambassador"
            },
            "positionNameTranslations": {
              "description": "Translations for position name in different languages",
              "example": {
                "en": "Ambassador",
                "am": "አምባሳደር"
              },
              "allOf": [
                {
                  "$ref": "#/components/schemas/TranslationDto"
                }
              ]
            },
            "description": {
              "type": "string",
              "description": "A description of the position.",
              "example": "Represents the country in a foreign nation."
            },
            "level": {
              "type": "number",
              "description": "The hierarchy level of the position (supports decimals like 1.5, 2.5).",
              "example": 1.5
            },
            "isMany": {
              "type": "boolean",
              "description": "Whether this position allows multiple users (true) or single user only (false).",
              "example": false,
              "default": false
            }
          }
        },
        "CreateOrganizationPositionDto": {
          "type": "object",
          "properties": {
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "canCreateOutgoing": {
              "type": "boolean",
              "description": "Permission to create outgoing letters.",
              "default": false
            },
            "canEscalateOutgoing": {
              "type": "boolean",
              "description": "Permission to escalate outgoing letters.",
              "default": false
            },
            "canForwardOutgoing": {
              "type": "boolean",
              "description": "Permission to forward outgoing letters.",
              "default": false
            },
            "canDispatchOutgoing": {
              "type": "boolean",
              "description": "Permission to dispatch outgoing letters.",
              "default": false
            },
            "canReturnOutgoing": {
              "type": "boolean",
              "description": "Permission to return outgoing letters.",
              "default": false
            },
            "canTransferOutgoing": {
              "type": "boolean",
              "description": "Permission to transfer outgoing letters.",
              "default": false
            },
            "canReturnIncoming": {
              "type": "boolean",
              "description": "Permission to return incoming letters.",
              "default": false
            },
            "canAcceptIncoming": {
              "type": "boolean",
              "description": "Permission to accept incoming letters.",
              "default": false
            },
            "canReplyIncoming": {
              "type": "boolean",
              "description": "Permission to reply to incoming letters.",
              "default": false
            },
            "canForwardIncoming": {
              "type": "boolean",
              "description": "Permission to forward incoming letters.",
              "default": false
            },
            "canTransferIncoming": {
              "type": "boolean",
              "description": "Permission to transfer incoming letters.",
              "default": false
            },
            "canForwardToRecordOffice": {
              "type": "boolean",
              "description": "Permission to forward a letter to the record office.",
              "default": false
            },
            "canViewForwardedOutgoing": {
              "type": "boolean",
              "description": "Permission to view letters forwarded down the hierarchy.",
              "default": false
            },
            "canViewEscalatedOutgoing": {
              "type": "boolean",
              "description": "Permission to view letters escalated up the hierarchy.",
              "default": false
            },
            "canViewOutgoing": {
              "type": "boolean",
              "description": "Permission to view all outgoing letters.",
              "default": false
            },
            "canViewRecordOffices": {
              "type": "boolean",
              "description": "Permission to view all record office organizations.",
              "default": false
            },
            "canCreateJobAssignment": {
              "type": "boolean",
              "description": "Permission to can Create Job Assignment.",
              "default": false
            },
            "canViewJobAssignment": {
              "type": "boolean",
              "description": "Permission to can view Job Assignment.",
              "default": false
            },
            "canDeleteJobAssignment": {
              "type": "boolean",
              "description": "Permission to can delete Job Assignment.",
              "default": false
            },
            "canViewReport": {
              "type": "boolean",
              "description": "Permission to view reports.",
              "default": false
            }
          },
          "required": [
            "organizationId",
            "positionId"
          ]
        },
        "UpdateOrganizationPositionDto": {
          "type": "object",
          "properties": {
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "canCreateOutgoing": {
              "type": "boolean",
              "description": "Permission to create outgoing letters.",
              "default": false
            },
            "canEscalateOutgoing": {
              "type": "boolean",
              "description": "Permission to escalate outgoing letters.",
              "default": false
            },
            "canForwardOutgoing": {
              "type": "boolean",
              "description": "Permission to forward outgoing letters.",
              "default": false
            },
            "canDispatchOutgoing": {
              "type": "boolean",
              "description": "Permission to dispatch outgoing letters.",
              "default": false
            },
            "canReturnOutgoing": {
              "type": "boolean",
              "description": "Permission to return outgoing letters.",
              "default": false
            },
            "canTransferOutgoing": {
              "type": "boolean",
              "description": "Permission to transfer outgoing letters.",
              "default": false
            },
            "canReturnIncoming": {
              "type": "boolean",
              "description": "Permission to return incoming letters.",
              "default": false
            },
            "canAcceptIncoming": {
              "type": "boolean",
              "description": "Permission to accept incoming letters.",
              "default": false
            },
            "canReplyIncoming": {
              "type": "boolean",
              "description": "Permission to reply to incoming letters.",
              "default": false
            },
            "canForwardIncoming": {
              "type": "boolean",
              "description": "Permission to forward incoming letters.",
              "default": false
            },
            "canTransferIncoming": {
              "type": "boolean",
              "description": "Permission to transfer incoming letters.",
              "default": false
            },
            "canForwardToRecordOffice": {
              "type": "boolean",
              "description": "Permission to forward a letter to the record office.",
              "default": false
            },
            "canViewForwardedOutgoing": {
              "type": "boolean",
              "description": "Permission to view letters forwarded down the hierarchy.",
              "default": false
            },
            "canViewEscalatedOutgoing": {
              "type": "boolean",
              "description": "Permission to view letters escalated up the hierarchy.",
              "default": false
            },
            "canViewOutgoing": {
              "type": "boolean",
              "description": "Permission to view all outgoing letters.",
              "default": false
            },
            "canViewRecordOffices": {
              "type": "boolean",
              "description": "Permission to view all record office organizations.",
              "default": false
            },
            "canCreateJobAssignment": {
              "type": "boolean",
              "description": "Permission to can Create Job Assignment.",
              "default": false
            },
            "canViewJobAssignment": {
              "type": "boolean",
              "description": "Permission to can view Job Assignment.",
              "default": false
            },
            "canDeleteJobAssignment": {
              "type": "boolean",
              "description": "Permission to can delete Job Assignment.",
              "default": false
            },
            "canViewReport": {
              "type": "boolean",
              "description": "Permission to view reports.",
              "default": false
            }
          }
        },
        "CreateRoleDto": {
          "type": "object",
          "properties": {
            "roleName": {
              "type": "string",
              "description": "The name of the role.",
              "example": "Administrator"
            },
            "description": {
              "type": "string",
              "description": "A description of the role.",
              "example": "Full access to all system functionalities."
            }
          },
          "required": [
            "roleName"
          ]
        },
        "UpdateRoleDto": {
          "type": "object",
          "properties": {
            "roleName": {
              "type": "string",
              "description": "The name of the role.",
              "example": "Administrator"
            },
            "description": {
              "type": "string",
              "description": "A description of the role.",
              "example": "Full access to all system functionalities."
            }
          }
        },
        "CreateUserRoleDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The ID of the user.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "userId",
            "roleId"
          ]
        },
        "UserRoleResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "userRoleId": {
              "type": "string",
              "description": "The unique identifier for the user-role assignment.",
              "format": "uuid"
            },
            "userId": {
              "type": "string",
              "description": "The ID of the user.",
              "format": "uuid"
            },
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid"
            },
            "assignedAt": {
              "type": "string",
              "description": "The timestamp when the role was assigned.",
              "format": "date-time"
            },
            "user": {
              "description": "The associated user details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/UserResponseDto"
                }
              ]
            },
            "role": {
              "description": "The associated role details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/RoleResponseDto"
                }
              ]
            }
          },
          "required": [
            "userRoleId",
            "userId",
            "roleId",
            "assignedAt",
            "user",
            "role"
          ]
        },
        "UpdateUserRoleDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The ID of the user.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          }
        },
        "CreatePermissionDto": {
          "type": "object",
          "properties": {
            "permissionName": {
              "type": "string",
              "description": "The name of the permission.",
              "example": "create_organization"
            },
            "description": {
              "type": "string",
              "description": "A description of the permission.",
              "example": "Allows creation of new organization records."
            }
          },
          "required": [
            "permissionName"
          ]
        },
        "UpdatePermissionDto": {
          "type": "object",
          "properties": {
            "permissionName": {
              "type": "string",
              "description": "The name of the permission.",
              "example": "create_organization"
            },
            "description": {
              "type": "string",
              "description": "A description of the permission.",
              "example": "Allows creation of new organization records."
            }
          }
        },
        "SyncRolePermissionsDto": {
          "type": "object",
          "properties": {
            "permissionIds": {
              "description": "List of permission UUIDs to sync with the role",
              "example": [
                "30d521f0-b8e6-488c-b007-0d7613964428",
                "d6d43219-6ef7-44cc-9e8b-4146b3d3c2e5"
              ],
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              }
            }
          },
          "required": [
            "permissionIds"
          ]
        },
        "RolePermissionResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "rolePermissionId": {
              "type": "string",
              "description": "The unique identifier for the role-permission assignment.",
              "format": "uuid"
            },
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid"
            },
            "permissionId": {
              "type": "string",
              "description": "The ID of the permission.",
              "format": "uuid"
            },
            "assignedAt": {
              "type": "string",
              "description": "The timestamp when the permission was assigned to the role.",
              "format": "date-time"
            },
            "role": {
              "description": "The associated role details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/RoleResponseDto"
                }
              ]
            },
            "permission": {
              "description": "The associated permission details (if loaded).",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/PermissionResponseDto"
                }
              ]
            }
          },
          "required": [
            "rolePermissionId",
            "roleId",
            "permissionId",
            "assignedAt",
            "role",
            "permission"
          ]
        },
        "CreateRolePermissionsDto": {
          "type": "object",
          "properties": {
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "permissionIds": {
              "description": "An array of permission IDs to assign to the role.",
              "example": [
                "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "f1e2d3c4-b5a6-9876-5432-10fedcba9876"
              ],
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              }
            }
          },
          "required": [
            "roleId",
            "permissionIds"
          ]
        },
        "CreateRolePermissionDto": {
          "type": "object",
          "properties": {
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "permissionId": {
              "type": "string",
              "description": "The ID of the permission.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "roleId",
            "permissionId"
          ]
        },
        "UpdateRolePermissionDto": {
          "type": "object",
          "properties": {
            "roleId": {
              "type": "string",
              "description": "The ID of the role.",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "permissionId": {
              "type": "string",
              "description": "The ID of the permission.",
              "format": "uuid",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          }
        },
        "CreatePriorityDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the priority",
              "example": "High",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the priority",
              "example": "Indicates a high-level urgency.",
              "maxLength": 1000
            }
          },
          "required": [
            "name"
          ]
        },
        "UpdatePriorityDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the priority",
              "example": "High",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the priority",
              "example": "Indicates a high-level urgency.",
              "maxLength": 1000
            }
          }
        },
        "CreateConfidentialityDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the confidentiality level",
              "example": "Confidential",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the confidentiality level",
              "example": "Data restricted to authorized personnel only.",
              "maxLength": 1000
            }
          },
          "required": [
            "name"
          ]
        },
        "UpdateConfidentialityDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the confidentiality level",
              "example": "Confidential",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the confidentiality level",
              "example": "Data restricted to authorized personnel only.",
              "maxLength": 1000
            }
          }
        },
        "CreateLanguageDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the language",
              "example": "English",
              "maxLength": 255
            },
            "languageCode": {
              "type": "string",
              "description": "The ISO code of the language",
              "example": "en",
              "maxLength": 10
            },
            "letterDateLabel": {
              "type": "string",
              "description": "Letter date label",
              "example": "Date",
              "maxLength": 50
            },
            "enclosureLabel": {
              "type": "string",
              "description": "Enclosure label",
              "example": "Attachments",
              "maxLength": 50
            },
            "letterRefLabel": {
              "type": "string",
              "description": "Letter reference label",
              "example": "Reference No.",
              "maxLength": 50
            },
            "letterToLabel": {
              "type": "string",
              "description": "Letter recipient label",
              "example": "To",
              "maxLength": 50
            },
            "letterSubjectLabel": {
              "type": "string",
              "description": "Letter subject label",
              "example": "Subject",
              "maxLength": 50
            },
            "letterCCLabel": {
              "type": "string",
              "description": "Letter carbon copy (CC) label",
              "example": "CC",
              "maxLength": 50
            },
            "description": {
              "type": "string",
              "description": "A brief description of the language",
              "example": "Standard English language.",
              "maxLength": 1000
            }
          },
          "required": [
            "name",
            "languageCode"
          ]
        },
        "UpdateLanguageDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the language",
              "example": "English",
              "maxLength": 255
            },
            "languageCode": {
              "type": "string",
              "description": "The ISO code of the language",
              "example": "en",
              "maxLength": 10
            },
            "letterDateLabel": {
              "type": "string",
              "description": "Letter date label",
              "example": "Date",
              "maxLength": 50
            },
            "enclosureLabel": {
              "type": "string",
              "description": "Enclosure label",
              "example": "Attachments",
              "maxLength": 50
            },
            "letterRefLabel": {
              "type": "string",
              "description": "Letter reference label",
              "example": "Reference No.",
              "maxLength": 50
            },
            "letterToLabel": {
              "type": "string",
              "description": "Letter recipient label",
              "example": "To",
              "maxLength": 50
            },
            "letterSubjectLabel": {
              "type": "string",
              "description": "Letter subject label",
              "example": "Subject",
              "maxLength": 50
            },
            "letterCCLabel": {
              "type": "string",
              "description": "Letter carbon copy (CC) label",
              "example": "CC",
              "maxLength": 50
            },
            "description": {
              "type": "string",
              "description": "A brief description of the language",
              "example": "Standard English language.",
              "maxLength": 1000
            }
          }
        },
        "CreateDocumentCategoryDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the document category",
              "example": "Office of the Minister",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the document category",
              "example": "Main directorate handling ministerial affairs",
              "maxLength": 1000
            },
            "code": {
              "type": "string",
              "description": "Hierarchical code for the category (e.g., OM-ADM-PER)",
              "example": "OM",
              "maxLength": 50
            },
            "parentCategoryId": {
              "type": "string",
              "description": "Parent category ID for hierarchical structure",
              "example": "123e4567-e89b-12d3-a456-426614174000",
              "format": "uuid"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the category is active",
              "example": true,
              "default": true
            },
            "expirationYears": {
              "type": "number",
              "description": "Number of years after which documents in this category expire for disposal",
              "example": 5,
              "minimum": 1,
              "maximum": 100
            },
            "recordOfficeIds": {
              "description": "Array of record office organization IDs to assign this category to",
              "example": [
                "123e4567-e89b-12d3-a456-426614174000"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "name"
          ]
        },
        "DocumentCategoryResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The unique identifier of the user who created the entity.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The unique identifier of the document category.",
              "format": "uuid"
            },
            "name": {
              "type": "string",
              "description": "The name of the document category."
            },
            "description": {
              "type": "string",
              "description": "The description of the document category.",
              "nullable": true
            },
            "level": {
              "type": "number",
              "description": "The hierarchical level of the category (1=Series, 2=Subseries, 3=Files)."
            },
            "code": {
              "type": "string",
              "description": "The hierarchical code of the category.",
              "nullable": true
            },
            "storagePath": {
              "type": "string",
              "description": "The storage path for documents in this category.",
              "nullable": true
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the category is active."
            },
            "expirationYears": {
              "type": "number",
              "description": "Number of years after which documents in this category expire for disposal.",
              "nullable": true,
              "example": 5
            },
            "parentCategoryId": {
              "type": "string",
              "description": "The ID of the parent category.",
              "format": "uuid",
              "nullable": true
            },
            "parentCategory": {
              "type": "object",
              "description": "Parent category information",
              "nullable": true
            },
            "childCategories": {
              "type": "array",
              "description": "Child categories"
            },
            "recordOfficeAssignments": {
              "type": "array",
              "description": "Record offices assigned to this category"
            }
          },
          "required": [
            "documentCategoryId",
            "name",
            "description",
            "level",
            "code",
            "storagePath",
            "isActive",
            "expirationYears",
            "parentCategoryId"
          ]
        },
        "UpdateDocumentCategoryDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the document category",
              "example": "Office of the Minister",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the document category",
              "example": "Main directorate handling ministerial affairs",
              "maxLength": 1000
            },
            "code": {
              "type": "string",
              "description": "Hierarchical code for the category (e.g., OM-ADM-PER)",
              "example": "OM",
              "maxLength": 50
            },
            "parentCategoryId": {
              "type": "string",
              "description": "Parent category ID for hierarchical structure",
              "example": "123e4567-e89b-12d3-a456-426614174000",
              "format": "uuid"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the category is active",
              "example": true,
              "default": true
            },
            "expirationYears": {
              "type": "number",
              "description": "Number of years after which documents in this category expire for disposal",
              "example": 5,
              "minimum": 1,
              "maximum": 100
            },
            "recordOfficeIds": {
              "description": "Array of record office organization IDs to assign this category to",
              "example": [
                "123e4567-e89b-12d3-a456-426614174000"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "CreateDocumentDto": {
          "type": "object",
          "properties": {
            "documentSubject": {
              "type": "string",
              "description": "The subject of the document",
              "example": "Annual Financial Report 2024"
            },
            "status": {
              "type": "string",
              "description": "Status of the document"
            },
            "is_active": {
              "type": "boolean",
              "description": "Indicates if the document is active",
              "example": true
            },
            "is_semi_active": {
              "type": "boolean",
              "description": "Indicates if the document is semi-active",
              "example": false
            },
            "is_archived": {
              "type": "boolean",
              "description": "Indicates if the document is archived",
              "example": false
            },
            "is_retained": {
              "type": "boolean",
              "description": "Indicates if the document is retained",
              "example": false
            },
            "referenceNumber": {
              "type": "string",
              "description": "The unique reference number of the document",
              "example": "REF-2024-001"
            },
            "documentYear": {
              "type": "string",
              "description": "The year the document pertains to (YYYY-MM-DD format)",
              "example": "2024-01-01",
              "format": "date"
            },
            "receivedDate": {
              "type": "string",
              "description": "The date the document was received (YYYY-MM-DD format)",
              "example": "2024-07-20",
              "format": "date"
            },
            "priorityId": {
              "type": "string",
              "description": "The UUID of the priority level for the document",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "confidentialityId": {
              "type": "string",
              "description": "The UUID of the confidentiality level for the document",
              "example": "b1c2d3e4-f5a6-7890-1234-567890abcdef"
            },
            "languageId": {
              "type": "string",
              "description": "The UUID of the language for the document",
              "example": "c1d2e3f4-a5b6-7890-1234-567890abcdef"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The UUID of the document category",
              "example": "d1e2f3a4-b5c6-7890-1234-567890abcdef"
            },
            "qrCode": {
              "type": "string",
              "description": "The QR code string associated with the document",
              "example": "QR12345"
            },
            "descriptions": {
              "type": "string",
              "description": "A detailed description of the document",
              "example": "This document contains the financial statements for the fiscal year 2024, including balance sheets and income statements."
            },
            "sourceOrganizationId": {
              "type": "string",
              "description": "The organization from which the document originated",
              "format": "uuid",
              "example": "e1f2g3h4-i5j6-7890-1234-567890abcdef"
            },
            "senderName": {
              "type": "string",
              "description": "The name of the sender of the document",
              "example": "John Doe"
            },
            "expireYear": {
              "type": "string",
              "description": "The expiration year of the document (YYYY-MM-DD format)",
              "example": "2025-12-31",
              "format": "date"
            },
            "shelfRowId": {
              "type": "string",
              "description": "The shelf row ID for document storage",
              "example": "uuid-shelf-row-id"
            },
            "country": {
              "type": "string",
              "description": "The country related to the document",
              "example": "Ethiopia"
            },
            "tags": {
              "description": "Tags associated with the document",
              "example": [
                "finance",
                "annual",
                "report"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "documentSubject",
            "referenceNumber",
            "documentYear",
            "priorityId",
            "confidentialityId",
            "languageId",
            "documentCategoryId",
            "descriptions"
          ]
        },
        "UpdateDocumentDto": {
          "type": "object",
          "properties": {
            "documentSubject": {
              "type": "string",
              "description": "The subject of the document",
              "example": "Annual Financial Report 2024"
            },
            "status": {
              "type": "string",
              "description": "Status of the document"
            },
            "is_active": {
              "type": "boolean",
              "description": "Indicates if the document is active",
              "example": true
            },
            "is_semi_active": {
              "type": "boolean",
              "description": "Indicates if the document is semi-active",
              "example": false
            },
            "is_archived": {
              "type": "boolean",
              "description": "Indicates if the document is archived",
              "example": false
            },
            "is_retained": {
              "type": "boolean",
              "description": "Indicates if the document is retained",
              "example": false
            },
            "referenceNumber": {
              "type": "string",
              "description": "The unique reference number of the document",
              "example": "REF-2024-001"
            },
            "documentYear": {
              "type": "string",
              "description": "The year the document pertains to (YYYY-MM-DD format)",
              "example": "2024-01-01",
              "format": "date"
            },
            "receivedDate": {
              "type": "string",
              "description": "The date the document was received (YYYY-MM-DD format)",
              "example": "2024-07-20",
              "format": "date"
            },
            "priorityId": {
              "type": "string",
              "description": "The UUID of the priority level for the document",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "confidentialityId": {
              "type": "string",
              "description": "The UUID of the confidentiality level for the document",
              "example": "b1c2d3e4-f5a6-7890-1234-567890abcdef"
            },
            "languageId": {
              "type": "string",
              "description": "The UUID of the language for the document",
              "example": "c1d2e3f4-a5b6-7890-1234-567890abcdef"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The UUID of the document category",
              "example": "d1e2f3a4-b5c6-7890-1234-567890abcdef"
            },
            "qrCode": {
              "type": "string",
              "description": "The QR code string associated with the document",
              "example": "QR12345"
            },
            "descriptions": {
              "type": "string",
              "description": "A detailed description of the document",
              "example": "This document contains the financial statements for the fiscal year 2024, including balance sheets and income statements."
            },
            "sourceOrganizationId": {
              "type": "string",
              "description": "The organization from which the document originated",
              "format": "uuid",
              "example": "e1f2g3h4-i5j6-7890-1234-567890abcdef"
            },
            "senderName": {
              "type": "string",
              "description": "The name of the sender of the document",
              "example": "John Doe"
            },
            "expireYear": {
              "type": "string",
              "description": "The expiration year of the document (YYYY-MM-DD format)",
              "example": "2025-12-31",
              "format": "date"
            },
            "shelfRowId": {
              "type": "string",
              "description": "The shelf row ID for document storage",
              "example": "uuid-shelf-row-id"
            },
            "country": {
              "type": "string",
              "description": "The country related to the document",
              "example": "Ethiopia"
            },
            "tags": {
              "description": "Tags associated with the document",
              "example": [
                "finance",
                "annual",
                "report"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "documentFilePath": {
              "description": "Array of new or updated file paths for the main document (MinIO object names)",
              "example": [
                "documents/main/new-doc-1.pdf",
                "documents/main/new-doc-2.pdf"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "supportDocumentFilePath": {
              "description": "Array of new or updated file paths for support documents (MinIO object names)",
              "example": [
                "documents/support/support-doc-1.pdf"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "VerifyMetadataDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "description": "The verification status for document metadata",
              "enum": [
                "METADATA_VERIFIED",
                "METADATA_REJECTED"
              ],
              "example": "METADATA_VERIFIED"
            },
            "rejectionReason": {
              "type": "string",
              "description": "Reason for rejecting the metadata (required if status is METADATA_REJECTED)",
              "example": "Document category is incorrect for this type of content"
            }
          },
          "required": [
            "status"
          ]
        },
        "CreateNotificationDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "User ID to send notification to",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "title": {
              "type": "string",
              "description": "Notification title",
              "example": "New Document Assigned"
            },
            "message": {
              "type": "string",
              "description": "Notification message",
              "example": "A new document has been assigned to you for review."
            },
            "type": {
              "type": "string",
              "description": "Type of notification",
              "enum": [
                "workflow",
                "assignment",
                "delegation",
                "general",
                "document",
                "INCOMING_LETTER_ASSIGNED",
                "INCOMING_LETTER_CC"
              ],
              "example": "assignment"
            },
            "relatedEntityId": {
              "type": "string",
              "description": "Related entity ID (e.g., document ID, letter ID)",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "relatedEntityType": {
              "type": "string",
              "description": "Type of related entity",
              "enum": [
                "incoming_letter",
                "outgoing_letter",
                "document"
              ],
              "example": "document"
            }
          },
          "required": [
            "userId",
            "title",
            "message",
            "type"
          ]
        },
        "CreateShelfDto": {
          "type": "object",
          "properties": {
            "shelfNumber": {
              "type": "string",
              "description": "The shelf number or identifier",
              "example": "A"
            },
            "recordCenterId": {
              "type": "string",
              "description": "The record center ID where this shelf belongs",
              "example": "uuid-record-center-id"
            },
            "totalCapacity": {
              "type": "number",
              "description": "Total capacity of the shelf (number of rows)",
              "example": 100
            },
            "shelfType": {
              "type": "string",
              "description": "Type of shelf",
              "example": "Standard"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the shelf is active",
              "example": true
            }
          },
          "required": [
            "shelfNumber",
            "recordCenterId",
            "totalCapacity"
          ]
        },
        "ShelfRowDto": {
          "type": "object",
          "properties": {
            "shelfRowId": {
              "type": "string",
              "description": "Shelf row ID",
              "example": "uuid-shelf-row-id"
            },
            "rowNumber": {
              "type": "number",
              "description": "Row number",
              "example": 1
            },
            "label": {
              "type": "string",
              "description": "Display label for the row",
              "example": "Row 001"
            },
            "locationPath": {
              "type": "string",
              "description": "Location path for storage",
              "example": "SRC-A-001"
            },
            "isAvailable": {
              "type": "boolean",
              "description": "Whether the row is available",
              "example": true
            }
          },
          "required": [
            "shelfRowId",
            "rowNumber",
            "label",
            "locationPath",
            "isAvailable"
          ]
        },
        "ShelfDto": {
          "type": "object",
          "properties": {
            "shelfId": {
              "type": "string",
              "description": "Shelf ID",
              "example": "uuid-shelf-id"
            },
            "shelfNumber": {
              "type": "string",
              "description": "Shelf number",
              "example": "A"
            },
            "shelfType": {
              "type": "string",
              "description": "Shelf type",
              "example": "Standard"
            },
            "totalCapacity": {
              "type": "number",
              "description": "Total capacity of the shelf",
              "example": 100
            },
            "usedCapacity": {
              "type": "number",
              "description": "Used capacity of the shelf",
              "example": 25
            },
            "availableCapacity": {
              "type": "number",
              "description": "Available capacity of the shelf",
              "example": 75
            },
            "availableRows": {
              "description": "Available shelf rows",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ShelfRowDto"
              }
            }
          },
          "required": [
            "shelfId",
            "shelfNumber",
            "totalCapacity",
            "usedCapacity",
            "availableCapacity",
            "availableRows"
          ]
        },
        "RecordCenterDto": {
          "type": "object",
          "properties": {
            "recordCenterId": {
              "type": "string",
              "description": "Record center ID",
              "example": "uuid-record-center-id"
            },
            "name": {
              "type": "string",
              "description": "Record center name",
              "example": "Secret Records Storage Center"
            },
            "code": {
              "type": "string",
              "description": "Record center code",
              "example": "SRC"
            },
            "shelves": {
              "description": "Shelves with available rows",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ShelfDto"
              }
            }
          },
          "required": [
            "recordCenterId",
            "name",
            "code",
            "shelves"
          ]
        },
        "HierarchicalShelfAvailabilityDto": {
          "type": "object",
          "properties": {
            "recordCenters": {
              "description": "Record centers with available shelf rows",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/RecordCenterDto"
              }
            },
            "totalAvailableRows": {
              "type": "number",
              "description": "Total number of available rows across all record centers",
              "example": 150
            }
          },
          "required": [
            "recordCenters",
            "totalAvailableRows"
          ]
        },
        "ShelfAvailabilityDto": {
          "type": "object",
          "properties": {
            "shelfRowId": {
              "type": "string",
              "description": "Shelf row ID",
              "example": "uuid-shelf-row-id"
            },
            "label": {
              "type": "string",
              "description": "Display label for dropdown",
              "example": "Secret Records Storage - Shelf A - Row 001"
            },
            "recordCenterName": {
              "type": "string",
              "description": "Record center name",
              "example": "Secret Records Storage Center"
            },
            "recordCenterCode": {
              "type": "string",
              "description": "Record center code",
              "example": "SRC"
            },
            "shelfNumber": {
              "type": "string",
              "description": "Shelf number",
              "example": "A"
            },
            "rowNumber": {
              "type": "number",
              "description": "Row number",
              "example": 1
            },
            "isAvailable": {
              "type": "boolean",
              "description": "Whether the row is available",
              "example": true
            },
            "locationPath": {
              "type": "string",
              "description": "Location path for storage",
              "example": "SRC-A-001"
            }
          },
          "required": [
            "shelfRowId",
            "label",
            "recordCenterName",
            "recordCenterCode",
            "shelfNumber",
            "rowNumber",
            "isAvailable",
            "locationPath"
          ]
        },
        "UpdateShelfDto": {
          "type": "object",
          "properties": {
            "shelfNumber": {
              "type": "string",
              "description": "The shelf number or identifier",
              "example": "A"
            },
            "recordCenterId": {
              "type": "string",
              "description": "The record center ID where this shelf belongs",
              "example": "uuid-record-center-id"
            },
            "totalCapacity": {
              "type": "number",
              "description": "Total capacity of the shelf (number of rows)",
              "example": 100
            },
            "shelfType": {
              "type": "string",
              "description": "Type of shelf",
              "example": "Standard"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the shelf is active",
              "example": true
            }
          }
        },
        "AssignUserToTaskDto": {
          "type": "object",
          "properties": {
            "userid": {
              "type": "string",
              "description": "The ID of the user being assigned to the task",
              "example": "996a372d-0bc1-4f30-b466-d51de2ceb5b3"
            }
          },
          "required": [
            "userid"
          ]
        },
        "CheckCanDoTaskDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The ID of the user performing the task",
              "example": "996a372d-0bc1-4f30-b466-d51de2ceb5b3"
            },
            "task_type": {
              "type": "string",
              "description": "The type of the task to check",
              "example": "APPROVAL"
            },
            "task_id": {
              "type": "string",
              "description": "The ID of the task being checked",
              "example": "3a47b6b2-81f7-4b9b-8b79-733d9335fa4d"
            }
          },
          "required": [
            "userId",
            "task_type",
            "task_id"
          ]
        },
        "CreateTaskManagementDto": {
          "type": "object",
          "properties": {
            "task_type": {
              "type": "string",
              "description": "Type of the task",
              "example": "verify-document"
            },
            "task_description": {
              "type": "string",
              "description": "Detailed description of the task",
              "example": "Document verification for user application"
            },
            "task_category": {
              "type": "string",
              "description": "Category of the task",
              "example": "Document"
            },
            "organizationId": {
              "type": "string",
              "description": "Organization ID to which this task belongs",
              "example": "a4e3b65c-1234-4c91-87b8-9fdcb5a6a1b2"
            },
            "task_id": {
              "type": "string",
              "description": "Unique task identifier",
              "example": "task-20251001-001"
            },
            "assigned_to": {
              "type": "string",
              "description": "User ID assigned to this task",
              "example": "2f3c4a1b-98d1-4ad2-bb8b-3e4d212d83f9"
            },
            "assigned_by": {
              "type": "string",
              "description": "User ID who assigned the task",
              "example": "f83b2e2c-5a22-43a4-b1b3-77b27d9f9b65"
            },
            "is_on_progress": {
              "type": "boolean",
              "description": "Indicates if task is in progress",
              "example": false
            },
            "taken_action": {
              "type": "string",
              "description": "Action taken for this task",
              "example": "Verified and approved"
            },
            "action_taken_at": {
              "format": "date-time",
              "type": "string",
              "description": "Date when the action was taken",
              "example": "2025-10-01T12:00:00Z"
            },
            "task_status": {
              "type": "boolean",
              "description": "Task completion status",
              "example": false
            },
            "link": {
              "type": "string",
              "description": "Reference link related to the task",
              "example": "https://example.com/documents/123"
            }
          },
          "required": [
            "task_type",
            "task_description",
            "task_category",
            "task_id",
            "link"
          ]
        },
        "CreateDocumentRequestDto": {
          "type": "object",
          "properties": {
            "requestTopic": {
              "type": "string",
              "description": "General topic or subject of the document being requested.",
              "example": "Annual financial report for 2023",
              "maxLength": 255
            },
            "requestDescription": {
              "type": "string",
              "description": "Detailed description of the document or information needed.",
              "example": "Looking for documents related to Q4 2023 performance, including budget vs. actuals.",
              "maxLength": 1000
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The UUID of the document category for the request.",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            }
          },
          "required": [
            "requestTopic",
            "documentCategoryId"
          ]
        },
        "VerifyDocumentRequestDto": {
          "type": "object",
          "properties": {
            "comment": {
              "type": "string",
              "description": "Optional comments or justification for verifying the document request.",
              "nullable": true,
              "example": "All documents verified and ready for approval."
            }
          }
        },
        "ApproveDocumentRequestDto": {
          "type": "object",
          "properties": {
            "documentIds": {
              "description": "Array of UUIDs for the documents to link to this request.",
              "example": [
                "123e4567-e89b-12d3-a456-426614174000"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "canView": {
              "type": "boolean",
              "description": "Determines if users can view the shared documents.",
              "example": true
            },
            "canDownload": {
              "type": "boolean",
              "description": "Determines if users can download the shared documents.",
              "example": false
            },
            "tokenExpirationHours": {
              "type": "number",
              "description": "Number of hours the shared link will be active after the first access. Defaults to 24 if not provided.",
              "example": 10
            }
          },
          "required": [
            "documentIds",
            "canView",
            "canDownload"
          ]
        },
        "RejectDocumentRequestDto": {
          "type": "object",
          "properties": {
            "rejectionReason": {
              "type": "string",
              "description": "The reason for rejecting the document request.",
              "example": "The requested document is confidential and cannot be shared."
            }
          },
          "required": [
            "rejectionReason"
          ]
        },
        "UpdateDocumentRequestDto": {
          "type": "object",
          "properties": {
            "requestTopic": {
              "type": "string",
              "description": "The new updated topic for the document request.",
              "maxLength": 255
            },
            "requestDescription": {
              "type": "string",
              "description": "The new updated detailed description of the document request."
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The UUID of the new document category for the request.",
              "format": "uuid"
            }
          }
        },
        "CreateLetterTypeDto": {
          "type": "object",
          "properties": {
            "typeName": {
              "type": "string",
              "description": "Name of the letter type",
              "example": "Internal Letter",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description of the letter type",
              "example": "Template for internal letters",
              "maxLength": 1000
            },
            "isPublic": {
              "type": "boolean",
              "description": "Indicates if the letter type is available for public use",
              "example": false,
              "default": false
            }
          },
          "required": [
            "typeName"
          ]
        },
        "UpdateLetterTypeDto": {
          "type": "object",
          "properties": {
            "typeName": {
              "type": "string",
              "description": "Name of the letter type",
              "example": "Internal Letter",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description of the letter type",
              "example": "Template for internal letters",
              "maxLength": 1000
            },
            "isPublic": {
              "type": "boolean",
              "description": "Indicates if the letter type is available for public use",
              "example": false,
              "default": false
            }
          }
        },
        "LetterTypeResponseDto": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "MEMO",
                "OUTGOING",
                "INTERNAL"
              ],
              "description": "The type of the letter (MEMO or OUTGOING).",
              "example": "OUTGOING"
            }
          },
          "required": [
            "type"
          ]
        },
        "CreateLetterTemplateTypeDto": {
          "type": "object",
          "properties": {
            "templateTypeName": {
              "type": "string",
              "description": "Name of the letter template type",
              "example": "Official Letter",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description of the letter template type",
              "example": "Template for official letters",
              "maxLength": 1000
            }
          },
          "required": [
            "templateTypeName"
          ]
        },
        "UpdateLetterTemplateTypeDto": {
          "type": "object",
          "properties": {
            "templateTypeName": {
              "type": "string",
              "description": "Name of the letter template type",
              "example": "Official Letter",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description of the letter template type",
              "example": "Template for official letters",
              "maxLength": 1000
            }
          }
        },
        "CreateLetterTemplateMultipartDto": {
          "type": "object",
          "properties": {
            "templateName": {
              "type": "string",
              "example": "Official Invitation",
              "description": "Unique template name"
            },
            "subject": {
              "type": "string",
              "example": "Invitation to annual meeting"
            },
            "body": {
              "type": "string",
              "example": "Dear Sir/Madam, ...",
              "description": "Full body text "
            },
            "closure": {
              "type": "string",
              "example": "Sincerely"
            },
            "letterTemplateTypeId": {
              "type": "string",
              "example": "3b0d9b7e-0d4f-4f66-95c7-6d7e6d4f0b33",
              "description": "Letter template type id"
            },
            "file": {
              "type": "string",
              "format": "binary"
            }
          },
          "required": [
            "templateName",
            "subject",
            "body",
            "closure",
            "letterTemplateTypeId"
          ]
        },
        "LetterTemplateResponseDto": {
          "type": "object",
          "properties": {
            "letterTemplateId": {
              "type": "string"
            },
            "templateName": {
              "type": "string"
            },
            "subject": {
              "type": "string"
            },
            "body": {
              "type": "string"
            },
            "closure": {
              "type": "string"
            },
            "letterTemplateTypeId": {
              "type": "string"
            },
            "createdBy": {
              "type": "string"
            },
            "letterTemplateFilePath": {
              "type": "string"
            },
            "updatedBy": {
              "type": "string",
              "nullable": true
            },
            "createdAt": {
              "format": "date-time",
              "type": "string"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string"
            },
            "letterTemplateTypeName": {
              "type": "string",
              "description": "Template type name",
              "nullable": true
            },
            "createdByName": {
              "type": "string",
              "description": "Creator full name",
              "nullable": true
            },
            "updatedByName": {
              "type": "string",
              "description": "Updator full name",
              "nullable": true
            }
          },
          "required": [
            "letterTemplateId",
            "templateName",
            "subject",
            "body",
            "closure",
            "letterTemplateTypeId",
            "createdBy",
            "letterTemplateFilePath",
            "createdAt",
            "updatedAt"
          ]
        },
        "PaginatedLetterTemplateDto": {
          "type": "object",
          "properties": {
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LetterTemplateResponseDto"
              }
            },
            "total": {
              "type": "number"
            },
            "page": {
              "type": "number"
            },
            "limit": {
              "type": "number"
            }
          },
          "required": [
            "items",
            "total",
            "page",
            "limit"
          ]
        },
        "UpdateLetterTemplateMultipartDto": {
          "type": "object",
          "properties": {
            "templateName": {
              "type": "string",
              "example": "Official Invitation",
              "description": "Unique template name"
            },
            "subject": {
              "type": "string",
              "example": "Invitation to annual meeting"
            },
            "body": {
              "type": "string",
              "example": "Dear Sir/Madam, ...",
              "description": "Full body text "
            },
            "closure": {
              "type": "string",
              "example": "Sincerely"
            },
            "letterTemplateTypeId": {
              "type": "string",
              "example": "3b0d9b7e-0d4f-4f66-95c7-6d7e6d4f0b33",
              "description": "Letter template type id"
            },
            "file": {
              "type": "string",
              "format": "binary"
            }
          }
        },
        "OrganizationDto": {
          "type": "object",
          "properties": {
            "organizationId": {
              "type": "string",
              "description": "The unique identifier for the organization.",
              "format": "uuid"
            },
            "organizationName": {
              "type": "string",
              "description": "The name of the organization."
            },
            "address": {
              "type": "string",
              "description": "The address of the organization.",
              "nullable": true
            },
            "contactEmail": {
              "type": "string",
              "description": "The contact email of the organization.",
              "nullable": true
            },
            "contactPhone": {
              "type": "string",
              "description": "The contact phone number of the organization.",
              "nullable": true
            },
            "parentOrganizationId": {
              "type": "string",
              "description": "The ID of the parent organization, if any.",
              "format": "uuid",
              "nullable": true
            },
            "createdBy": {
              "type": "string",
              "description": "The user who created the organization."
            },
            "updatedBy": {
              "type": "string",
              "description": "The user who last updated the organization."
            }
          },
          "required": [
            "organizationId",
            "organizationName",
            "address",
            "contactEmail",
            "contactPhone",
            "parentOrganizationId",
            "createdBy",
            "updatedBy"
          ]
        },
        "PositionDto": {
          "type": "object",
          "properties": {
            "positionId": {
              "type": "string",
              "description": "The unique identifier for the position.",
              "format": "uuid"
            },
            "positionName": {
              "type": "string",
              "description": "The name of the position."
            },
            "description": {
              "type": "string",
              "description": "The description of the position.",
              "nullable": true
            }
          },
          "required": [
            "positionId",
            "positionName",
            "description"
          ]
        },
        "OrganizationPositionDto": {
          "type": "object",
          "properties": {
            "organizationPositionId": {
              "type": "string",
              "description": "The unique identifier for the organization position.",
              "format": "uuid"
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization.",
              "format": "uuid"
            },
            "positionId": {
              "type": "string",
              "description": "The ID of the position.",
              "format": "uuid"
            },
            "canCreateOutgoing": {
              "type": "boolean",
              "description": "Can this role create outgoing letters?"
            },
            "canEscalateOutgoing": {
              "type": "boolean",
              "description": "Can this role escalate outgoing letters?"
            },
            "canForwardOutgoing": {
              "type": "boolean",
              "description": "Can this role forward outgoing letters?"
            },
            "canDispatchOutgoing": {
              "type": "boolean",
              "description": "Can this role dispatch outgoing letters?"
            },
            "canReturnOutgoing": {
              "type": "boolean",
              "description": "Can this role return outgoing letters?"
            },
            "canTransferOutgoing": {
              "type": "boolean",
              "description": "Can this role transfer outgoing letters?"
            },
            "canForwardToRecordOffice": {
              "type": "boolean",
              "description": "Can this role transfer outgoing letters?"
            },
            "canReturnIncoming": {
              "type": "boolean",
              "description": "Can this role return incoming letters?"
            },
            "canAcceptIncoming": {
              "type": "boolean",
              "description": "Can this role accept incoming letters?"
            },
            "canReplyIncoming": {
              "type": "boolean",
              "description": "Can this role reply to incoming letters?"
            },
            "canForwardIncoming": {
              "type": "boolean",
              "description": "Can this role forward incoming letters?"
            },
            "canTransferIncoming": {
              "type": "boolean",
              "description": "Can this role transfer incoming letters?"
            },
            "canViewForwardedOutgoing": {
              "type": "boolean",
              "description": "Can this role view forwarded outgoing letters?"
            },
            "canViewEscalatedOutgoing": {
              "type": "boolean",
              "description": "Can this role view escalated outgoing letters?"
            },
            "canViewOutgoing": {
              "type": "boolean",
              "description": "Can this role view outgoing letters?"
            },
            "canViewRecordOffices": {
              "type": "boolean",
              "description": "Can this role view record offices?"
            },
            "organization": {
              "description": "The related organization details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationDto"
                }
              ]
            },
            "position": {
              "description": "The related position details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/PositionDto"
                }
              ]
            }
          },
          "required": [
            "organizationPositionId",
            "organizationId",
            "positionId",
            "canCreateOutgoing",
            "canEscalateOutgoing",
            "canForwardOutgoing",
            "canDispatchOutgoing",
            "canReturnOutgoing",
            "canTransferOutgoing",
            "canForwardToRecordOffice",
            "canReturnIncoming",
            "canAcceptIncoming",
            "canReplyIncoming",
            "canForwardIncoming",
            "canTransferIncoming",
            "canViewForwardedOutgoing",
            "canViewEscalatedOutgoing",
            "canViewOutgoing",
            "canViewRecordOffices",
            "organization",
            "position"
          ]
        },
        "UserDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The unique identifier of the user.",
              "format": "uuid"
            },
            "username": {
              "type": "string",
              "description": "The username of the user."
            },
            "fullName": {
              "type": "string",
              "description": "The full name of the user."
            },
            "email": {
              "type": "string",
              "description": "The email of the user."
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the user's primary organization.",
              "format": "uuid",
              "nullable": true
            },
            "organizationPositionId": {
              "type": "string",
              "description": "The ID of the user's position within an organization.",
              "format": "uuid",
              "nullable": true
            },
            "isActive": {
              "type": "boolean",
              "description": "Is the user active?"
            },
            "isEmailVerified": {
              "type": "boolean",
              "description": "Is the user's email verified?"
            },
            "delegatedBy": {
              "type": "string",
              "description": "The ID of the user this user is delegated by.",
              "format": "uuid",
              "nullable": true
            },
            "organization": {
              "description": "The related organization details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationDto"
                }
              ]
            },
            "organizationPosition": {
              "description": "The related organization position details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationPositionDto"
                }
              ]
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The creation date of the user."
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The last update date of the user."
            }
          },
          "required": [
            "userId",
            "username",
            "fullName",
            "email",
            "organizationId",
            "organizationPositionId",
            "isActive",
            "isEmailVerified",
            "delegatedBy",
            "organization",
            "organizationPosition",
            "createdAt",
            "updatedAt"
          ]
        },
        "SourceOrganizationDto": {
          "type": "object",
          "properties": {
            "SourceOrganizationID": {
              "type": "string",
              "description": "The unique identifier of the source organization.",
              "format": "uuid"
            },
            "sourceOrganizationName": {
              "type": "string",
              "description": "The name of the source organization."
            },
            "sourceOrganizationType": {
              "type": "string",
              "description": "The type of the source organization.",
              "enum": [
                "Government",
                "NGO",
                "Private",
                "International"
              ]
            },
            "address": {
              "type": "string",
              "description": "The address of the source organization."
            },
            "contactPerson": {
              "type": "string",
              "description": "The contact person at the source organization."
            },
            "contactEmail": {
              "type": "string",
              "description": "The contact email of the source organization."
            },
            "contactPhone": {
              "type": "string",
              "description": "The contact phone number of the source organization."
            }
          },
          "required": [
            "SourceOrganizationID",
            "sourceOrganizationName",
            "sourceOrganizationType",
            "address",
            "contactPerson",
            "contactEmail",
            "contactPhone"
          ]
        },
        "OutgoingLetterToCcDto": {
          "type": "object",
          "properties": {
            "letterToCcId": {
              "type": "string",
              "description": "The ID of the letter to CC.",
              "format": "uuid"
            },
            "outgoingLetterId": {
              "type": "string",
              "description": "The ID of the outgoing letter.",
              "format": "uuid"
            },
            "userId": {
              "type": "string",
              "description": "The ID of the user who is the recipient, if applicable.",
              "format": "uuid",
              "nullable": true
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the organization that is the recipient, if applicable.",
              "format": "uuid",
              "nullable": true
            },
            "sourceOrganizationID": {
              "type": "string",
              "description": "The ID of the source organization that is the recipient, if applicable.",
              "format": "uuid",
              "nullable": true
            },
            "receiverName": {
              "type": "string",
              "description": "The recipient’s name."
            },
            "receiverOrganizationName": {
              "type": "string",
              "description": "The recipient’s organization name."
            },
            "address": {
              "type": "string",
              "description": "The recipient’s address."
            },
            "position": {
              "type": "string",
              "description": "The recipient’s position."
            },
            "user": {
              "description": "The related user details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/UserDto"
                }
              ]
            },
            "organization": {
              "description": "The related organization details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationDto"
                }
              ]
            },
            "sourceOrganization": {
              "description": "The related source organization details.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/SourceOrganizationDto"
                }
              ]
            },
            "type": {
              "type": "string",
              "description": "The type of recipient (TO or CC).",
              "enum": [
                "TO",
                "CC"
              ]
            }
          },
          "required": [
            "letterToCcId",
            "outgoingLetterId",
            "userId",
            "organizationId",
            "sourceOrganizationID",
            "receiverName",
            "receiverOrganizationName",
            "address",
            "position",
            "user",
            "organization",
            "sourceOrganization",
            "type"
          ]
        },
        "OutgoingLetterTrackingDto": {
          "type": "object",
          "properties": {
            "letterTrackingId": {
              "type": "string",
              "description": "The ID of the tracking record.",
              "format": "uuid"
            },
            "outgoingLetterId": {
              "type": "string",
              "description": "The ID of the outgoing letter.",
              "format": "uuid"
            },
            "action": {
              "type": "string",
              "description": "The type of action taken on the letter.",
              "enum": [
                "CREATED",
                "ESCALATED",
                "FORWARDED",
                "RETURNED",
                "TRANSFERRED",
                "DISPATCHED",
                "SIGNED",
                "APPROVED",
                "REJECTED",
                "DELETED",
                "ARCHIVED",
                "EDITED",
                "RECALLED",
                "FORKED",
                "COMPLETED",
                "CC_ADDED"
              ]
            },
            "actionById": {
              "type": "string",
              "description": "The ID of the user who performed the action.",
              "format": "uuid"
            },
            "notes": {
              "type": "string",
              "description": "Any relevant notes or comments on the action.",
              "nullable": true
            },
            "suggestion": {
              "type": "string",
              "description": "Any relevant suggestion on the action.",
              "nullable": true
            },
            "isActionTaken": {
              "type": "boolean",
              "description": "Indicates if an action has been taken.",
              "default": false
            },
            "nextActionTaken": {
              "type": "string",
              "description": "The next action to be taken on the letter.",
              "enum": [
                "CREATED",
                "ESCALATED",
                "FORWARDED",
                "RETURNED",
                "TRANSFERRED",
                "DISPATCHED",
                "SIGNED",
                "APPROVED",
                "REJECTED",
                "DELETED",
                "ARCHIVED",
                "EDITED",
                "RECALLED",
                "FORKED",
                "COMPLETED",
                "CC_ADDED"
              ],
              "nullable": true
            },
            "nextActionTakenBy": {
              "type": "string",
              "description": "The ID of the user who will take the next action.",
              "format": "uuid",
              "nullable": true
            },
            "actionDate": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time of the action."
            },
            "fromUser": {
              "description": "The user who performed the action.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/UserDto"
                }
              ]
            },
            "toUser": {
              "description": "The user the letter was transferred or forwarded to.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/UserDto"
                }
              ]
            },
            "toOrganizationId": {
              "type": "string",
              "description": "The ID of the organization the letter was transferred or forwarded to.",
              "format": "uuid",
              "nullable": true
            },
            "toOrganization": {
              "description": "The organization the letter was transferred or forwarded to.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationDto"
                }
              ]
            },
            "fromUserOrgPos": {
              "description": "The organization position of the user who performed the action.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationPositionDto"
                }
              ]
            },
            "toUserOrgPos": {
              "description": "The organization position of the user the letter was transferred to.",
              "nullable": true,
              "allOf": [
                {
                  "$ref": "#/components/schemas/OrganizationPositionDto"
                }
              ]
            }
          },
          "required": [
            "letterTrackingId",
            "outgoingLetterId",
            "action",
            "actionById",
            "notes",
            "suggestion",
            "isActionTaken",
            "nextActionTaken",
            "nextActionTakenBy",
            "actionDate",
            "fromUser",
            "toUser",
            "toOrganizationId",
            "toOrganization",
            "fromUserOrgPos",
            "toUserOrgPos"
          ]
        },
        "OutgoingLetterResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the entity.",
              "format": "uuid"
            },
            "createdBy": {
              "type": "string",
              "description": "The user who created the letter.",
              "format": "uuid",
              "nullable": true
            },
            "updatedBy": {
              "type": "string",
              "description": "The unique identifier of the user who last updated the entity.",
              "format": "uuid",
              "nullable": true
            },
            "createdAt": {
              "type": "string",
              "description": "The date and time when the entity was created.",
              "format": "date-time"
            },
            "createAtEt": {
              "type": "string",
              "description": "The date and time when the entity was created, formatted in the Ethiopian Calendar system.",
              "example": "2018-03-21 01:16:01.718 E.T."
            },
            "updatedAt": {
              "type": "string",
              "description": "The date and time when the entity was last updated.",
              "format": "date-time"
            },
            "outgoingLetterId": {
              "type": "string",
              "description": "The unique identifier for the outgoing letter.",
              "format": "uuid"
            },
            "type": {
              "type": "string",
              "description": "The type of the letter.",
              "enum": [
                "MEMO",
                "OUTGOING",
                "INTERNAL"
              ]
            },
            "subject": {
              "type": "string",
              "description": "The subject of the letter."
            },
            "body": {
              "type": "string",
              "description": "The main body/content of the letter."
            },
            "closure": {
              "type": "string",
              "description": "The closing remarks of the letter."
            },
            "enclosure": {
              "type": "string",
              "description": "Enclosure information or description."
            },
            "internalTrackingNumber": {
              "type": "string",
              "description": "internal tracking number for the letter."
            },
            "priorityId": {
              "type": "string",
              "description": "The ID of the letter's priority.",
              "format": "uuid"
            },
            "parentLetterId": {
              "type": "string",
              "description": "The  original letter's ID.",
              "format": "uuid"
            },
            "forkedFromLetter": {
              "type": "string",
              "description": "The  original letter's ID which the letter is forked or forewareded.",
              "format": "uuid"
            },
            "transferredFromLetterId": {
              "type": "string",
              "description": "The  original letter's ID which the letter is transferred from.",
              "format": "uuid"
            },
            "confidentialityId": {
              "type": "string",
              "description": "The ID of the letter's confidentiality level.",
              "format": "uuid"
            },
            "languageId": {
              "type": "string",
              "description": "The ID of the letter's language.",
              "format": "uuid"
            },
            "status": {
              "type": "string",
              "description": "The status of the letter  ."
            },
            "tags": {
              "description": "Optional tags for the letter.",
              "example": [
                "official",
                "report"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "documentId": {
              "type": "string",
              "description": "The ID of the document.",
              "format": "uuid",
              "nullable": true
            },
            "sourceOrganizationID": {
              "type": "string",
              "description": "The ID of the source organization.",
              "format": "uuid",
              "nullable": true
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the parent organization.",
              "format": "uuid",
              "nullable": true
            },
            "currentAssigneeId": {
              "type": "string",
              "description": "The current assigned user for the letter.",
              "format": "uuid",
              "nullable": true
            },
            "currentAssigneeOrganization": {
              "type": "string",
              "description": "The current assigned orginization for the letter.",
              "format": "uuid",
              "nullable": true
            },
            "recipients": {
              "description": "List of recipients.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/OutgoingLetterToCcDto"
              }
            },
            "tracking": {
              "description": "History of actions taken on the letter.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/OutgoingLetterTrackingDto"
              }
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The ID of thedocument Category.",
              "format": "uuid",
              "nullable": true
            },
            "serviceType": {
              "type": "string",
              "description": "The service type for the letter.",
              "nullable": true
            },
            "incomingLetterId": {
              "type": "string",
              "description": "the replied incoming letter ID.",
              "nullable": true
            },
            "sentBy": {
              "type": "string",
              "description": "Sent by for the letter.",
              "nullable": true
            },
            "toRecipients": {
              "description": "List of primary recipients (TO).",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/OutgoingLetterToCcDto"
              }
            },
            "ccRecipients": {
              "description": "List of carbon copy recipients (CC).",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/OutgoingLetterToCcDto"
              }
            },
            "outgoingAttachmentFilepaths": {
              "description": "List of file attachment paths or IDs.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "outgoingFilepaths": {
              "description": "List of file attachment path.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "isArchived": {
              "type": "boolean",
              "description": "is the letter is is archived.",
              "default": false
            },
            "isSeen": {
              "type": "boolean",
              "description": "Has the current user seen this letter?"
            },
            "versions": {
              "description": "All versions of this letter (edit history)",
              "items": {
                "type": "array"
              },
              "type": "array"
            },
            "copiedLetters": {
              "description": "All copies of this letter ",
              "items": {
                "type": "array"
              },
              "type": "array"
            },
            "forkedCopies": {
              "type": "array",
              "items": {
                "description": "List of letters that were forked/copied from this letter.",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                }
              }
            },
            "transferredCopies": {
              "type": "array",
              "items": {
                "description": "List of letters that were  tranfered/copied from this letter.",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/OutgoingLetterResponseDto"
                }
              }
            },
            "usersSeen": {
              "description": "Users who have seen the letter",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "outgoingLetterId",
            "type",
            "subject",
            "body",
            "closure",
            "enclosure",
            "internalTrackingNumber",
            "priorityId",
            "parentLetterId",
            "forkedFromLetter",
            "transferredFromLetterId",
            "confidentialityId",
            "languageId",
            "status",
            "tags",
            "documentId",
            "sourceOrganizationID",
            "organizationId",
            "currentAssigneeId",
            "currentAssigneeOrganization",
            "recipients",
            "tracking",
            "documentCategoryId",
            "serviceType",
            "incomingLetterId",
            "sentBy",
            "toRecipients",
            "ccRecipients",
            "outgoingAttachmentFilepaths",
            "outgoingFilepaths",
            "isArchived",
            "versions",
            "copiedLetters",
            "forkedCopies",
            "transferredCopies"
          ]
        },
        "ReDistributeLetterDto": {
          "type": "object",
          "properties": {
            "toUserIds": {
              "example": [
                "3fa85f64-5717-4562-b3fc-2c963f66afa6"
              ],
              "description": "List of User IDs to receive a copy of this letter",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "toOrganizationIds": {
              "example": [
                "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
              ],
              "description": "List of Organization IDs to receive a copy of this letter",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "comment": {
              "type": "string",
              "example": "Please review this memo or outgoing letter as per our discussion."
            },
            "suggestion": {
              "type": "string",
              "example": "Follow up within 2 days."
            }
          },
          "required": [
            "comment"
          ]
        },
        "LetterVersionEditorDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The unique identifier of the user who edited this version",
              "format": "uuid",
              "example": "e5f6a7b8-c9d0-1234-ef12-345678901234"
            },
            "fullName": {
              "type": "string",
              "description": "The full name of the editor",
              "example": "Jane Smith"
            },
            "email": {
              "type": "string",
              "description": "The email address of the editor",
              "example": "jane.smith@example.com"
            }
          },
          "required": [
            "userId",
            "fullName",
            "email"
          ]
        },
        "OutgoingLetterVersionResponseDto": {
          "type": "object",
          "properties": {
            "versionId": {
              "type": "string",
              "description": "The unique identifier for this version",
              "format": "uuid",
              "example": "f6a7b8c9-d0e1-2345-f123-456789012345"
            },
            "outgoingLetterId": {
              "type": "string",
              "description": "The ID of the original outgoing letter",
              "format": "uuid",
              "example": "a7b8c9d0-e1f2-3456-1234-567890123456"
            },
            "versionNumber": {
              "type": "integer",
              "description": "The version number (incremental: 1, 2, 3...)",
              "example": 2
            },
            "type": {
              "type": "string",
              "description": "The type of the letter at this version",
              "enum": [
                "MEMO",
                "OUTGOING",
                "INTERNAL"
              ],
              "example": "OUTGOING"
            },
            "subject": {
              "type": "string",
              "description": "The subject of the letter at this version",
              "example": "Quarterly Report Submission"
            },
            "body": {
              "type": "string",
              "description": "The body content of the letter at this version",
              "example": "Dear Sir/Madam, Please find attached the quarterly report..."
            },
            "closure": {
              "type": "string",
              "description": "The closing remarks of the letter at this version",
              "nullable": true,
              "example": "Thank you for your attention to this matter."
            },
            "enclosure": {
              "type": "string",
              "description": "Enclosure information or description.",
              "nullable": true,
              "example": "The attement of the  letter contain 3 pages "
            },
            "priorityId": {
              "type": "string",
              "description": "The priority ID at this version",
              "format": "uuid",
              "example": "b8c9d0e1-f2a3-4567-2345-678901234567"
            },
            "confidentialityId": {
              "type": "string",
              "description": "The confidentiality ID at this version",
              "format": "uuid",
              "example": "c9d0e1f2-a3b4-5678-3456-789012345678"
            },
            "languageId": {
              "type": "string",
              "description": "The language ID at this version",
              "format": "uuid",
              "example": "d0e1f2a3-b4c5-6789-4567-890123456789"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The document Category ID at this version",
              "format": "uuid",
              "nullable": true,
              "example": "e1f2a3b4-c5d6-7890-5678-901234567890"
            },
            "serviceType": {
              "type": "string",
              "description": "The service type at this version",
              "nullable": true,
              "example": "Express Delivery"
            },
            "tags": {
              "description": "The tags associated with the letter at this version",
              "example": [
                "urgent",
                "confidential",
                "financial"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "outgoingFilepaths": {
              "type": "string",
              "description": "The main letter file path at this version",
              "nullable": true,
              "example": "outgoing-letters/user-123/1640000000-main.pdf"
            },
            "outgoingAttachmentFilepaths": {
              "description": "The attachment file paths at this version",
              "example": [
                "outgoing-letters/user-123/1640000001-attachment1.pdf",
                "outgoing-letters/user-123/1640000002-attachment2.docx"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "editedBy": {
              "type": "string",
              "description": "The ID of the user who edited and created this version",
              "format": "uuid",
              "example": "f2a3b4c5-d6e7-8901-6789-012345678901"
            },
            "editReason": {
              "type": "string",
              "description": "The reason provided for editing (creating this version)",
              "nullable": true,
              "example": "Fixed typos in body text and updated recipient address"
            },
            "createdAt": {
              "type": "string",
              "description": "When this version was created (when the edit occurred)",
              "format": "date-time",
              "example": "2024-01-15T10:30:00.000Z"
            },
            "editor": {
              "description": "Information about the user who edited this version",
              "allOf": [
                {
                  "$ref": "#/components/schemas/LetterVersionEditorDto"
                }
              ]
            },
            "recipients": {
              "description": "List of all recipients (TO and CC) at this version",
              "items": {
                "type": "array"
              },
              "type": "array"
            }
          },
          "required": [
            "versionId",
            "outgoingLetterId",
            "versionNumber",
            "type",
            "subject",
            "body",
            "closure",
            "enclosure",
            "priorityId",
            "confidentialityId",
            "languageId",
            "documentCategoryId",
            "serviceType",
            "tags",
            "outgoingFilepaths",
            "outgoingAttachmentFilepaths",
            "editedBy",
            "editReason",
            "createdAt",
            "editor",
            "recipients"
          ]
        },
        "ForwardToRecordOfficeDto": {
          "type": "object",
          "properties": {
            "toOrganizationId": {
              "type": "string",
              "description": "The ID of the destination record office organization.",
              "format": "uuid"
            },
            "comment": {
              "type": "string",
              "description": "An optional comment for the forwarding action.",
              "minLength": 3
            },
            "suggestion": {
              "type": "string",
              "description": "An optional suggestion for the forwarding action.",
              "minLength": 3
            }
          },
          "required": [
            "toOrganizationId"
          ]
        },
        "ForwardToOutgoingOrganizationDto": {
          "type": "object",
          "properties": {
            "toOrganizationId": {
              "type": "string",
              "description": "The ID of the organization to forward the letter to.",
              "format": "uuid"
            },
            "comment": {
              "type": "string",
              "description": "An optional comment for the forwarding action.",
              "minLength": 3
            },
            "suggestion": {
              "type": "string",
              "description": "An optional suggestion for the forwarding action.",
              "minLength": 3
            }
          },
          "required": [
            "toOrganizationId"
          ]
        },
        "ForwardMemoDto": {
          "type": "object",
          "properties": {
            "toUserIds": {
              "description": "Array of user IDs to forward the memo to",
              "example": [
                "uuid-1",
                "uuid-2"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "toOrganizationIds": {
              "description": "Array of organization IDs to forward the memo to",
              "example": [
                "uuid-3",
                "uuid-4"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "comment": {
              "type": "string",
              "description": "Optional comment for forwarding the memo",
              "example": "Please review this memo and provide feedback"
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the recipients",
              "example": "This requires urgent attention"
            }
          }
        },
        "ForwardedRecipientDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "User ID if forwarded to a user",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "organizationId": {
              "type": "string",
              "description": "Organization ID if forwarded to an organization",
              "example": "123e4567-e89b-12d3-a456-426614174002"
            },
            "recipientName": {
              "type": "string",
              "description": "Recipient name",
              "example": "John Doe"
            },
            "recipientType": {
              "type": "string",
              "description": "Recipient type",
              "enum": [
                "USER",
                "ORGANIZATION"
              ],
              "example": "USER"
            }
          },
          "required": [
            "recipientName",
            "recipientType"
          ]
        },
        "ForwardMemoResponseDto": {
          "type": "object",
          "properties": {
            "letterId": {
              "type": "string",
              "description": "The letter ID that was forwarded",
              "example": "123e4567-e89b-12d3-a456-426614174003"
            },
            "message": {
              "type": "string",
              "description": "Status message",
              "example": "Memo successfully forwarded to 3 recipient(s)"
            },
            "forwardedTo": {
              "description": "List of recipients the memo was forwarded to",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ForwardedRecipientDto"
              }
            },
            "forwardedAt": {
              "format": "date-time",
              "type": "string",
              "description": "Timestamp when the memo was forwarded",
              "example": "2025-01-15T10:30:00.000Z"
            },
            "forwardedBy": {
              "type": "string",
              "description": "Name of the user who forwarded the memo",
              "example": "Jane Smith"
            },
            "usersCount": {
              "type": "number",
              "description": "Number of users the memo was forwarded to",
              "example": 2
            },
            "organizationsCount": {
              "type": "number",
              "description": "Number of organizations the memo was forwarded to",
              "example": 1
            }
          },
          "required": [
            "letterId",
            "message",
            "forwardedTo",
            "forwardedAt",
            "forwardedBy",
            "usersCount",
            "organizationsCount"
          ]
        },
        "TransferMemoDto": {
          "type": "object",
          "properties": {
            "toUserIds": {
              "description": "Array of user IDs to transfer the memo to",
              "example": [
                "uuid-1"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "toOrganizationIds": {
              "description": "Array of organization IDs to transfer the memo to",
              "example": [
                "uuid-3"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "comment": {
              "type": "string",
              "description": "Optional comment/reason for the transfer",
              "example": "Transferring for department execution"
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the next action",
              "example": "Please process the attached documents"
            }
          }
        },
        "TransferMemoResponseDto": {
          "type": "object",
          "properties": {}
        },
        "RecallOutgoingLetterDto": {
          "type": "object",
          "properties": {
            "reason": {
              "type": "string",
              "description": "Reason for recalling the letter",
              "example": "Need to make urgent corrections before recipient reviews"
            }
          }
        },
        "EscalateToOrganizationDto": {
          "type": "object",
          "properties": {
            "toOrganizationId": {
              "type": "string",
              "description": "The ID of the organization to which the letter is being escalated.",
              "format": "uuid"
            },
            "comment": {
              "type": "string",
              "description": "Optional comments for the escalation.",
              "nullable": true
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the escalation.",
              "nullable": true
            }
          },
          "required": [
            "toOrganizationId"
          ]
        },
        "EscalateOutgoingLetterDto": {
          "type": "object",
          "properties": {
            "toUserId": {
              "type": "string",
              "description": "The ID of the user to whom the letter is being escalated.",
              "format": "uuid"
            },
            "comment": {
              "type": "string",
              "description": "Optional comments for the escalation.",
              "nullable": true
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the escalation.",
              "nullable": true
            }
          },
          "required": [
            "toUserId"
          ]
        },
        "TransferOutgoingLetterDto": {
          "type": "object",
          "properties": {
            "toOrganizationId": {
              "type": "string",
              "description": "The UUID of the destination organization. Required if toUserId is not provided.",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "format": "uuid"
            },
            "toUserId": {
              "type": "string",
              "description": "The UUID of the destination user. Required if toOrganizationId is not provided.",
              "example": "fedcba09-8765-4321-feba-dcba09876543",
              "format": "uuid"
            },
            "comment": {
              "type": "string",
              "description": "An optional comment or justification for the transfer.",
              "example": "Transferring to the Legal Department for final approval."
            },
            "suggestion": {
              "type": "string",
              "description": "An optional suggestion for the head of the organization or user on how to proceed with the letter.",
              "example": "Please review and forward to the Director within 24 hours."
            }
          }
        },
        "CompleteOutgoingLetterDto": {
          "type": "object",
          "properties": {
            "reason": {
              "type": "string",
              "description": "An optional reason or comment for marking the letter as completed.",
              "example": "Formal closure received from the recipient organization.",
              "maxLength": 500
            }
          }
        },
        "ReturnOutgoingToOrganizationDto": {
          "type": "object",
          "properties": {
            "comment": {
              "type": "string",
              "description": "Optional comments for the escalation.",
              "nullable": true
            }
          }
        },
        "DispatchOutgoingToOrganizationDto": {
          "type": "object",
          "properties": {
            "comment": {
              "type": "string",
              "description": "Optional comments for the dispatch.",
              "nullable": true
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The ID of the documnet catagory.",
              "format": "uuid",
              "nullable": true
            }
          }
        },
        "RecipientDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The ID of a system user, if the recipient is an internal user.",
              "format": "uuid"
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of a system organization, if the recipient is an internal organization.",
              "format": "uuid"
            },
            "sourceOrganizationID": {
              "type": "string",
              "description": "The ID of a source organization, if the recipient is a pre-registered external organization.",
              "format": "uuid"
            },
            "receiverName": {
              "type": "string",
              "description": "The name of the recipient, used for non-system entities or for clarity.",
              "example": "John Doe"
            },
            "position": {
              "type": "string",
              "description": "The position or title of the recipient.",
              "example": "CEO"
            },
            "address": {
              "type": "string",
              "description": "The address of the recipient.",
              "example": "123 Main St, Anytown, USA"
            },
            "receiverOrganizationName": {
              "type": "string",
              "description": "The organization name of the recipient, for manual entries.",
              "example": "ABC Corp"
            }
          },
          "required": [
            "receiverName",
            "position",
            "address",
            "receiverOrganizationName"
          ]
        },
        "AddCcRecipientsDto": {
          "type": "object",
          "properties": {
            "recipients": {
              "description": "List of users or organizations to CC",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/RecipientDto"
              }
            },
            "comment": {
              "type": "string",
              "description": "Optional comment for the tracking record"
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the tracking record"
            }
          },
          "required": [
            "recipients"
          ]
        },
        "CreateSenderCategoryDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the sender category",
              "example": "WHO",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the sender category",
              "example": "World Health Organization",
              "maxLength": 1000
            }
          },
          "required": [
            "name"
          ]
        },
        "UpdateSenderCategoryDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the sender category",
              "example": "WHO",
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "A brief description of the sender category",
              "example": "World Health Organization",
              "maxLength": 1000
            }
          }
        },
        "UpdateIncomingLetterDto": {
          "type": "object",
          "properties": {
            "subject": {
              "type": "string",
              "description": "Subject of the incoming letter",
              "example": "Request for Partnership Agreement"
            },
            "body": {
              "type": "string",
              "description": "Body content of the letter",
              "example": "We would like to propose a partnership..."
            },
            "referenceNumber": {
              "type": "string",
              "description": "Reference number of the letter",
              "example": "REF-2024-001"
            },
            "senderName": {
              "type": "string",
              "description": "Name of the sender",
              "example": "John Doe"
            },
            "internalTrackingNumber": {
              "type": "string",
              "description": "Internal tracking number",
              "example": "ITN-INC-001"
            },
            "qrCode": {
              "type": "string",
              "description": "QR Code for the letter",
              "example": "QR123456"
            },
            "writtenDate": {
              "type": "string",
              "description": "Date when the letter was written",
              "example": "2024-01-10T00:00:00Z"
            },
            "receivedDate": {
              "type": "string",
              "description": "Date when the letter was received",
              "example": "2024-01-15T10:00:00Z"
            },
            "priorityId": {
              "type": "string",
              "description": "Priority ID of the letter",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "confidentialityId": {
              "type": "string",
              "description": "Confidentiality ID of the letter",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "languageId": {
              "type": "string",
              "description": "Language ID of the letter",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "sourceOrganizationId": {
              "type": "string",
              "description": "Sender category ID",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "Letter category ID",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "currentAssigneeId": {
              "type": "string",
              "description": "Current assignee user ID (if not provided, defaults to the creator)",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "isUrgent": {
              "type": "boolean",
              "description": "Whether the letter is urgent",
              "example": false,
              "default": false
            },
            "currentAssigneeOrganizationPositionId": {
              "type": "string",
              "description": "Current assignee organization position ID",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "currentAssigneeUserId": {
              "type": "string",
              "description": "Current assignee user ID (specific user assignment)",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "sourceType": {
              "type": "string",
              "description": "Source type of the letter",
              "example": "RECORD_OFFICE",
              "enum": [
                "PUBLIC",
                "RECORD_OFFICE"
              ],
              "default": "RECORD_OFFICE"
            },
            "publicSenderId": {
              "type": "string",
              "description": "Public sender ID (for letters from OUTSIDER users)",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            }
          }
        },
        "ForwardToOrganizationPositionDto": {
          "type": "object",
          "properties": {
            "targetOrganizationPositionId": {
              "type": "string",
              "description": "Target organization position ID to forward the letter to",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "reason": {
              "type": "string",
              "description": "Reason for forwarding the letter",
              "example": "Forwarding for review and approval"
            },
            "notifyHigherOfficials": {
              "type": "boolean",
              "description": "Whether to notify higher officials in the organization",
              "example": true,
              "default": true
            },
            "note": {
              "type": "string",
              "description": "Additional note for the forwarding action",
              "example": "Please review the attached documents carefully"
            },
            "decision": {
              "type": "string",
              "description": "Decision or instruction for the forwarding action",
              "example": "Please review and provide feedback by end of week"
            }
          },
          "required": [
            "targetOrganizationPositionId"
          ]
        },
        "ForwardToOrganizationDto": {
          "type": "object",
          "properties": {
            "organizationId": {
              "type": "string",
              "description": "The UUID of the target organization to forward the letter to",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "decision": {
              "type": "string",
              "description": "Decision or comment for forwarding the letter",
              "example": "Please handle this matter according to your department protocols"
            },
            "ccUserIds": {
              "description": "Optional array of user IDs to CC on this forward action",
              "example": [
                "user1-uuid",
                "user2-uuid"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "note": {
              "type": "string",
              "description": "Additional note for the forwarding action",
              "example": "Please handle this matter urgently"
            }
          },
          "required": [
            "organizationId",
            "decision"
          ]
        },
        "EscalateIncomingLetterDto": {
          "type": "object",
          "properties": {
            "reason": {
              "type": "string",
              "description": "Optional reason for escalation",
              "nullable": true
            },
            "comment": {
              "type": "string",
              "description": "Optional comment/note for the escalation",
              "nullable": true
            },
            "suggestion": {
              "type": "string",
              "description": "Optional suggestion for the supervisor",
              "nullable": true
            },
            "targetUserId": {
              "type": "string",
              "description": "The ID of the user to escalate to"
            }
          },
          "required": [
            "targetUserId"
          ]
        },
        "ReplyToLetterDto": {
          "type": "object",
          "properties": {
            "subject": {
              "type": "string",
              "description": "Subject of the reply letter",
              "example": "Re: Request for Partnership Agreement"
            },
            "body": {
              "type": "string",
              "description": "Body content of the reply letter",
              "example": "Thank you for your letter. We have reviewed your proposal..."
            },
            "decision": {
              "type": "string",
              "description": "Decision or response to the original letter",
              "example": "Approved with conditions"
            },
            "note": {
              "type": "string",
              "description": "Additional note for the reply",
              "example": "Please contact us for further details"
            }
          },
          "required": [
            "subject",
            "body"
          ]
        },
        "CategoryLetterTypePairDto": {
          "type": "object",
          "properties": {
            "documentCategoryId": {
              "type": "string",
              "description": "The ID of the document category",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174001"
            },
            "letterTypeId": {
              "type": "string",
              "description": "The ID of the letter type",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174002"
            }
          }
        },
        "AssignDocumentCategoryDto": {
          "type": "object",
          "properties": {
            "organizationId": {
              "type": "string",
              "description": "The ID of the record office organization",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "assignments": {
              "description": "Array of document category and letter type pairs to assign",
              "example": [
                {
                  "documentCategoryId": "123e4567-e89b-12d3-a456-426614174001",
                  "letterTypeId": "123e4567-e89b-12d3-a456-426614174002"
                },
                {
                  "documentCategoryId": "123e4567-e89b-12d3-a456-426614174003",
                  "letterTypeId": "123e4567-e89b-12d3-a456-426614174004"
                }
              ],
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/CategoryLetterTypePairDto"
              }
            }
          },
          "required": [
            "organizationId",
            "assignments"
          ]
        },
        "RecordOfficeAssignmentResponseDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique identifier of the assignment",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "organizationId": {
              "type": "string",
              "description": "The ID of the record office organization",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174001"
            },
            "organizationName": {
              "type": "string",
              "description": "The name of the record office organization",
              "example": "Central Records Office"
            },
            "documentCategoryId": {
              "type": "string",
              "description": "The ID of the document category",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174002"
            },
            "documentCategoryName": {
              "type": "string",
              "description": "The name of the document category",
              "example": "Legal Documents"
            },
            "letterTypeId": {
              "type": "string",
              "description": "The ID of the letter type",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174004"
            },
            "letterTypeName": {
              "type": "string",
              "description": "The name of the letter type",
              "example": "Agreement"
            },
            "assignedBy": {
              "type": "string",
              "description": "The ID of the user who assigned the category",
              "format": "uuid",
              "example": "123e4567-e89b-12d3-a456-426614174003"
            },
            "assignedByName": {
              "type": "string",
              "description": "The name of the user who assigned the category",
              "example": "John Doe"
            },
            "assignedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time when the assignment was made",
              "example": "2023-12-01T10:00:00Z"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the assignment is currently active",
              "example": true
            }
          },
          "required": [
            "id",
            "organizationId",
            "organizationName",
            "assignedBy",
            "assignedByName",
            "assignedAt",
            "isActive"
          ]
        },
        "CreatePrivateRoomDto": {
          "type": "object",
          "properties": {
            "participantId": {
              "type": "string",
              "description": "The UUID of the other user to start a private chat with.",
              "example": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6"
            }
          },
          "required": [
            "participantId"
          ]
        },
        "CreateGroupRoomDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the group chat.",
              "example": "Project Alpha Team"
            },
            "participantIds": {
              "description": "An array of user UUIDs to include in the group.",
              "example": [
                "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
                "f1e2d3c4-b5a6-9876-5432-10fedcba9876"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "name",
            "participantIds"
          ]
        },
        "EditMessageDto": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "description": "The new content for the message.",
              "example": "This is the edited message content."
            }
          },
          "required": [
            "content"
          ]
        },
        "RenameRoomDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The new name for the chat room.",
              "minLength": 1,
              "maxLength": 50,
              "example": "Project Alpha Team Chat"
            }
          },
          "required": [
            "name"
          ]
        },
        "AddMembersDto": {
          "type": "object",
          "properties": {
            "participantIds": {
              "description": "An array of user UUIDs to add to the group.",
              "example": [
                "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "participantIds"
          ]
        },
        "CreateRecordCenterDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the record center",
              "example": "Secret Records Storage Center"
            },
            "code": {
              "type": "string",
              "description": "The unique code for the record center",
              "example": "SRC"
            },
            "address": {
              "type": "string",
              "description": "The address of the record center",
              "example": "Building A, Floor 2, MoFA Complex"
            },
            "description": {
              "type": "string",
              "description": "Description of the record center",
              "example": "Secure storage facility for classified documents"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the record center is active",
              "example": true
            }
          },
          "required": [
            "name",
            "code"
          ]
        },
        "UpdateRecordCenterDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the record center",
              "example": "Secret Records Storage Center"
            },
            "code": {
              "type": "string",
              "description": "The unique code for the record center",
              "example": "SRC"
            },
            "address": {
              "type": "string",
              "description": "The address of the record center",
              "example": "Building A, Floor 2, MoFA Complex"
            },
            "description": {
              "type": "string",
              "description": "Description of the record center",
              "example": "Secure storage facility for classified documents"
            },
            "isActive": {
              "type": "boolean",
              "description": "Whether the record center is active",
              "example": true
            }
          }
        },
        "JobResponseDto": {
          "type": "object",
          "properties": {
            "jobId": {
              "type": "string",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "fileAttachment": {
              "example": [
                "file-123.pdf",
                "image-456.jpg"
              ],
              "description": "List of object names (keys) for files stored in MinIO.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "description": {
              "type": "string",
              "example": "Draft Q3 financial report."
            },
            "title": {
              "type": "string",
              "example": "financial report."
            },
            "letterTemplateId": {
              "type": "string",
              "example": "43d5c39d-791d-43fb-b1a1-b6f4c97f9a3b"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "example": "2025-10-13T08:00:00.000Z"
            },
            "createdById": {
              "type": "string",
              "example": "d1e2f3g4-h5i6-7890-1234-567890abcdef"
            },
            "status": {
              "type": "string",
              "example": "pending"
            },
            "organizationPositionId": {
              "type": "string",
              "example": "p1o2i3u4-y5t6-7890-1234-567890abcdef"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "example": "2025-10-13T09:00:00.000Z"
            }
          },
          "required": [
            "jobId",
            "fileAttachment",
            "description",
            "title",
            "letterTemplateId",
            "createdAt",
            "createdById",
            "status",
            "organizationPositionId",
            "updatedAt"
          ]
        },
        "CreateJobWithAssignmentDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Title of the job task.",
              "example": "Financial report."
            },
            "description": {
              "type": "string",
              "description": "A detailed description of the job task.",
              "example": "Draft Q3 financial report and attach supporting documents."
            },
            "fileAttachment": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "binary"
              },
              "description": "Array of NEW files to be uploaded and attached to the job. Max 5 files."
            },
            "assignedToIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "Array of User IDs to whom the job is being assigned (one or more).",
              "example": [
                "u1v2w3x4-y5z6-7890-1234-567890abcefg"
              ]
            },
            "endDate": {
              "format": "date-time",
              "type": "string",
              "description": "The deadline for completing the assignment.",
              "example": "2026-01-30T23:59:59Z"
            },
            "assignmentDescription": {
              "type": "string",
              "description": "Optional description or instructions for the assignment.",
              "example": "Ensure all supporting documents are attached."
            }
          },
          "required": [
            "title",
            "description",
            "assignedToIds",
            "endDate"
          ]
        },
        "UpdateJobWithAssignmentDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Optional new title of the job task.",
              "example": "Updated Financial Report Q3"
            },
            "description": {
              "type": "string",
              "description": "Optional updated description of the job task.",
              "example": "Revised draft of Q3 financial report."
            },
            "fileAttachment": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "binary"
              },
              "description": "Array of **NEW** files to be uploaded. Max 5 files. **Do not include existing files here.**"
            },
            "assignedToIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "Array of User IDs to whom the job should be newly assigned OR all current assignments (replaces previous list if provided).",
              "example": [
                "u1v2w3x4-y5z6-7890-1234-567890abcefg"
              ]
            },
            "endDate": {
              "format": "date-time",
              "type": "string",
              "description": "Optional new deadline for completing the assignment.",
              "example": "2027-01-30T23:59:59Z"
            },
            "assignmentDescription": {
              "type": "string",
              "description": "Optional updated description or instructions for the assignment.",
              "example": "Review the financial data for Q4 as well."
            },
            "filesToDelete": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Array of MinIO object keys (paths) of **EXISTING** files to be deleted.",
              "example": [
                "jobs/uuid/old-report.pdf"
              ]
            }
          }
        },
        "CreateJobAssignmentDto": {
          "type": "object",
          "properties": {
            "jobId": {
              "type": "string",
              "description": "The ID of the Job to be assigned.",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "assignedToIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "Array of User IDs to whom the job is being assigned (one or more).",
              "example": [
                "u1v2w3x4-y5z6-7890-1234-567890abcefg",
                "u5v6w7x8-y9z0-1234-5678-90abcdefgh"
              ]
            },
            "endDate": {
              "format": "date-time",
              "type": "string",
              "description": "The deadline for completing the assignment.",
              "example": "2026-01-30T23:59:59Z"
            },
            "description": {
              "type": "string",
              "description": "Optional description or instructions for the assignment.",
              "example": "Please focus on data integrity for this task."
            }
          },
          "required": [
            "jobId",
            "assignedToIds",
            "endDate"
          ]
        },
        "JobAssignmentResponseDto": {
          "type": "object",
          "properties": {
            "assignmentId": {
              "type": "string",
              "example": "z9y8x7w6-v5u4-3210-fedc-ba9876543210"
            },
            "assignedToId": {
              "type": "string",
              "example": "u1v2w3x4-y5z6-7890-1234-567890abcefg"
            },
            "assignedById": {
              "type": "string",
              "example": "d1e2f3g4-h5i6-7890-1234-567890abcdef"
            },
            "jobId": {
              "type": "string",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "endDate": {
              "format": "date-time",
              "type": "string",
              "example": "2026-01-30T23:59:59.000Z"
            },
            "assignedAt": {
              "format": "date-time",
              "type": "string",
              "example": "2025-10-13T12:00:00.000Z"
            },
            "isSeen": {
              "type": "boolean",
              "example": false
            },
            "status": {
              "type": "string",
              "example": "pending"
            }
          },
          "required": [
            "assignmentId",
            "assignedToId",
            "assignedById",
            "jobId",
            "endDate",
            "assignedAt",
            "isSeen"
          ]
        },
        "ForwardJobAssignmentDto": {
          "type": "object",
          "properties": {
            "assignedToIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "Array of User IDs to whom the job is being forwarded (one or more).",
              "example": [
                "u1v2w3x4-y5z6-7890-1234-567890abcefg",
                "u5v6w7x8-y9z0-1234-5678-90abcdefgh"
              ]
            },
            "endDate": {
              "format": "date-time",
              "type": "string",
              "description": "The new deadline for the forwarded assignment.",
              "example": "2026-02-15T10:00:00Z"
            },
            "comment": {
              "type": "string",
              "description": "A comment or new instructions for the forwarded users.",
              "example": "Please check section 3 and report back."
            },
            "status": {
              "type": "string",
              "description": "An updated status for the new assignments (e.g., \"re-assigned\"). Defaults to \"pending\".",
              "example": "pending"
            }
          },
          "required": [
            "assignedToIds"
          ]
        },
        "SubmitReviewDto": {
          "type": "object",
          "properties": {
            "feedback": {
              "type": "string",
              "description": "The review/feedback provided by the assigner on the submitted work.",
              "example": "Excellent work, report is approved. Please ensure all future dates are in UTC."
            },
            "status": {
              "type": "string",
              "enum": [
                "approved",
                "rejected"
              ],
              "description": "The final status of the assignment after review.",
              "example": "approved"
            }
          },
          "required": [
            "feedback",
            "status"
          ]
        },
        "SubmitAssignmentResponseDto": {
          "type": "object",
          "properties": {
            "feedback": {
              "type": "string",
              "description": "Detailed description of the work done for this assignment.",
              "example": "Completed the report draft, focusing on Q3 financial data integrity."
            },
            "feedbackFile": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "binary"
              },
              "description": "Array of files containing the completed work. Max 5 files."
            }
          },
          "required": [
            "feedback"
          ]
        },
        "CreateFeedbackDto": {
          "type": "object",
          "properties": {
            "assignmentId": {
              "type": "string",
              "description": "The ID of the assigment on which feedback given",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "message": {
              "type": "string",
              "description": "Feedback message",
              "example": "How can we respond for this task"
            }
          },
          "required": [
            "assignmentId"
          ]
        },
        "UpdateFeedbackDto": {
          "type": "object",
          "properties": {
            "feedbackConversionId": {
              "type": "string",
              "description": "The ID of the message which needed to update",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            "message": {
              "type": "string",
              "description": "Feedback message",
              "example": "How can we respond for this task"
            }
          },
          "required": [
            "feedbackConversionId"
          ]
        },
        "DeleteFeedbackDto": {
          "type": "object",
          "properties": {
            "feedbackConversionId": {
              "type": "string",
              "description": "The ID of the message which needed to delete",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "feedbackConversionId"
          ]
        },
        "SeeAllFeedbackDto": {
          "type": "object",
          "properties": {
            "assignmentId": {
              "type": "string",
              "description": "The ID of the assigment which you want to see all feedback",
              "example": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
          },
          "required": [
            "assignmentId"
          ]
        },
        "DashboardOverviewDto": {
          "type": "object",
          "properties": {
            "incomingLetters": {
              "type": "number",
              "description": "Total incoming letters count",
              "example": 18
            },
            "outgoingLetters": {
              "type": "number",
              "description": "Total outgoing letters count",
              "example": 22
            },
            "memos": {
              "type": "number",
              "description": "Total memos count",
              "example": 7
            },
            "activeDocuments": {
              "type": "number",
              "description": "Total active documents count",
              "example": 30
            },
            "semiActiveDocuments": {
              "type": "number",
              "description": "Total semi-active documents count",
              "example": 13
            },
            "archivedDocuments": {
              "type": "number",
              "description": "Total archived documents count",
              "example": 29
            }
          },
          "required": [
            "incomingLetters",
            "outgoingLetters",
            "memos",
            "activeDocuments",
            "semiActiveDocuments",
            "archivedDocuments"
          ]
        },
        "TimeSeriesDataPointDto": {
          "type": "object",
          "properties": {
            "period": {
              "type": "string",
              "description": "Time period label",
              "example": "Jan"
            },
            "count": {
              "type": "number",
              "description": "Count for this period",
              "example": 12
            },
            "periodLabel": {
              "type": "string",
              "description": "Readable period label",
              "example": "January 2025"
            },
            "date": {
              "type": "string",
              "description": "ISO date for this period",
              "example": "2025-01-01"
            }
          },
          "required": [
            "period",
            "count",
            "periodLabel",
            "date"
          ]
        },
        "LetterStatisticsDto": {
          "type": "object",
          "properties": {
            "data": {
              "description": "Time series data points",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TimeSeriesDataPointDto"
              }
            },
            "total": {
              "type": "number",
              "description": "Total count across all periods",
              "example": 247
            },
            "periodType": {
              "type": "string",
              "description": "Period type used for grouping",
              "example": "monthly"
            },
            "letterType": {
              "type": "string",
              "description": "Letter type filtered",
              "example": "incoming"
            }
          },
          "required": [
            "data",
            "total",
            "periodType",
            "letterType"
          ]
        },
        "LetterBreakdownItemDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Letter type name",
              "example": "Incoming"
            },
            "value": {
              "type": "number",
              "description": "Count for this type",
              "example": 12
            },
            "percentage": {
              "type": "number",
              "description": "Percentage of total",
              "example": 40
            },
            "color": {
              "type": "string",
              "description": "Color code for charts",
              "example": "#4A5A7A"
            }
          },
          "required": [
            "name",
            "value",
            "percentage",
            "color"
          ]
        },
        "LetterBreakdownDto": {
          "type": "object",
          "properties": {
            "data": {
              "description": "Breakdown by letter type",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LetterBreakdownItemDto"
              }
            },
            "total": {
              "type": "number",
              "description": "Total letters count",
              "example": 30
            }
          },
          "required": [
            "data",
            "total"
          ]
        },
        "TopSenderItemDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Sender name",
              "example": "US Embassy"
            },
            "value": {
              "type": "number",
              "description": "Number of letters sent",
              "example": 30
            },
            "percentage": {
              "type": "number",
              "description": "Percentage relative to top sender",
              "example": 100
            }
          },
          "required": [
            "name",
            "value",
            "percentage"
          ]
        },
        "TopSendersDto": {
          "type": "object",
          "properties": {
            "data": {
              "description": "Top senders data",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TopSenderItemDto"
              }
            },
            "total": {
              "type": "number",
              "description": "Total letters from all senders",
              "example": 147
            },
            "period": {
              "type": "string",
              "description": "Period analyzed",
              "example": "monthly"
            }
          },
          "required": [
            "data",
            "total",
            "period"
          ]
        },
        "AuditResponseDto": {
          "type": "object",
          "properties": {
            "auditId": {
              "type": "string",
              "description": "Audit record ID",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "modelName": {
              "type": "string",
              "description": "Model name",
              "example": "OutgoingLetter"
            },
            "recordId": {
              "type": "string",
              "description": "Record ID",
              "example": "123e4567-e89b-12d3-a456-426614174000"
            },
            "action": {
              "type": "string",
              "description": "Action performed",
              "enum": [
                "CREATE",
                "UPDATE",
                "DELETE",
                "READ",
                "EXPORT",
                "FORWARD",
                "ESCALATE",
                "DISPATCH",
                "RETURN",
                "RECALL",
                "APPROVE",
                "REJECT",
                "TRANSFER",
                "ACCEPT",
                "REPLY",
                "ASSIGN",
                "COMPLETE",
                "RECEIVE",
                "CREATED",
                "ESCALATED",
                "FORWARDED",
                "RETURNED",
                "TRANSFERRED",
                "DISPATCHED",
                "SIGNED",
                "APPROVED",
                "REJECTED",
                "DELETED",
                "ARCHIVED",
                "EDITED",
                "RECALLED",
                "FORKED",
                "VERIFIED",
                "EXPIRED",
                "PENDING",
                "REJECTED_BY_APPROVER",
                "AUTHORIZED"
              ],
              "example": "UPDATE"
            },
            "changes": {
              "type": "object",
              "description": "Changes made (before/after)"
            },
            "createdBy": {
              "type": "string",
              "description": "User who performed the action"
            },
            "createdByOrganizationPositionId": {
              "type": "string",
              "description": "Organization position ID"
            },
            "ethiopianYear": {
              "type": "number",
              "description": "Ethiopian year",
              "example": 2017
            },
            "ethiopianMonth": {
              "type": "number",
              "description": "Ethiopian month",
              "example": 3
            },
            "ethiopianDay": {
              "type": "number",
              "description": "Ethiopian day",
              "example": 15
            },
            "ethiopianDateString": {
              "type": "string",
              "description": "Ethiopian date string",
              "example": "2017-03-15"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "Creation timestamp",
              "example": "2024-11-26T10:30:00Z"
            },
            "ipAddress": {
              "type": "string",
              "description": "IP address"
            },
            "userAgent": {
              "type": "string",
              "description": "User agent"
            },
            "endpoint": {
              "type": "string",
              "description": "API endpoint"
            },
            "httpMethod": {
              "type": "string",
              "description": "HTTP method"
            },
            "user": {
              "type": "object",
              "description": "User details (if included)"
            },
            "organizationPosition": {
              "type": "object",
              "description": "Organization position details (if included)"
            }
          },
          "required": [
            "auditId",
            "modelName",
            "recordId",
            "action",
            "ethiopianYear",
            "ethiopianMonth",
            "ethiopianDay",
            "createdAt"
          ]
        },
        "AuditPaginationResponseDto": {
          "type": "object",
          "properties": {
            "data": {
              "description": "Array of audit records",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/AuditResponseDto"
              }
            },
            "meta": {
              "type": "object",
              "description": "Pagination metadata"
            }
          },
          "required": [
            "data",
            "meta"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
