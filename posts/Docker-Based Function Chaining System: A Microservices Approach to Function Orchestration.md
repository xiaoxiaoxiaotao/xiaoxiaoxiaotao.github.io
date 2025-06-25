---
title: "Docker-Based Function Chaining System: A Microservices Approach to Function Orchestration"
date: August 2024
tags:
  - Edge Computing
  - Serverless
description: This project aims to develop serverless edge computing functionalities and a function chain controller.
---

## Introduction

The Function Chaining System is an innovative microservices-based architecture that enables seamless function orchestration through Docker containers. This system demonstrates how to build a scalable and maintainable solution for chaining multiple functions together while maintaining loose coupling between services.

## System Architecture

The system consists of five main components, each running in its own Docker container:

1. **Controller Service**: Acts as the orchestrator, managing the flow of requests between services
2. **Number Service**: Handles initial number processing
3. **Odd Service**: Processes odd numbers
4. **Even Service**: Processes even numbers
5. **Common Error Handler**: Manages error scenarios across the function chain

### Network Architecture
- All services communicate through a dedicated Docker network (`my_docker_network`)
- Each service exposes a REST API endpoint on different ports (5000-5004)
- Inter-service communication is handled via HTTP/JSON

## Technical Implementation

### Core Technologies
- **Backend Services**: Written in Go using the Gin framework
- **Controller**: Implemented in Node.js using Express
- **Container Orchestration**: Docker
- **Communication Protocol**: REST APIs with JSON payloads
- **Configuration**: JSON-based service configuration

```go
package main

import (
	"Docker-even/functions"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "Failure",
			"result": "Welcome to the homepage!",
		})
	})

	r.POST("/api", func(c *gin.Context) {
		startTime := time.Now()

		// recieve a request
		var req Request
		if err := c.ShouldBindJSON(&req); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     "Invalid input format. Ensure input is a valid JSON.",
				"time_taken": "0",
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
			return
		}

		// Parse the JSON data into the Event
		var event functions.EvenOddEvent
		if err := json.Unmarshal([]byte(req.Root), &event); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     "Some error occurred while parsing input. Ensure that input is a valid JSON in correct format. Contact admin for more details.",
				"time_taken": "0",
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
			return
		}

		// handel the event
		message, err := functions.LambdaHandler(event)
		elapsed := time.Since(startTime)
		elapsedTime := float64(elapsed.Nanoseconds()) / 1e9 // Convert nanoseconds to seconds

		//return the result
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":     "Failure",
				"result":     err.Error(),
				"time_taken": fmt.Sprintf("%.9f", elapsedTime),
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"status":     "Success",
				"result":     message,
				"time_taken": fmt.Sprintf("%.9f", elapsedTime),
				"start_time": fmt.Sprintf("%d", startTime.Unix()),
			})
		}
	})

	r.POST("/api/shutdown", func(c *gin.Context) {
		shutdownServer(c)
	})

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"result": "success",
		})
	})

	if err := r.Run("0.0.0.0:5000"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}

func shutdownServer(c *gin.Context) {
	// Assume there's a condition to stop the server, such as receiving a signal or a scheduled task
	// Here's a simple example of stopping after a delay
	time.Sleep(5 * time.Second) // Assume waiting for 5 seconds before stopping the server

	// Create a context with a timeout of 5 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Call the server's Shutdown method to gracefully shutdown the server
	if err := c.Request.Context().Done(); err != nil {
		log.Fatalf("Shutdown error: %v", err)
	}

	r := gin.Default() // Declare the variable 'r' as a gin engine
	server := &http.Server{Addr: ":5000", Handler: r}
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"result": fmt.Sprintf("Server shutdown error: %v", err),
		})
	}
	log.Println("Server stopped gracefully")
	c.JSON(http.StatusOK, gin.H{
		"result": "Server stopped gracefully",
	})
}

type Request struct {
	Root string `json:"root"`
}
```


```JavaScript
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// read api_info.json to extract the information of APIs
let apiInfo = {};
try {
    const data = fs.readFileSync('api_info.json', 'utf8');
    apiInfo = JSON.parse(data);
} catch (err) {
    console.error('Error reading api_info.json:', err);
}

let startFunction = apiInfo.startFunction;

// define input from user
class UserInput {
    constructor(Number) {
        this.Number = Number;
    }
}

// define output of user
class FunctionOutput {
    constructor(result) {
        this.result = result;
    }
}

// format the JSON to the input format of functions
function formatData(outputResult) {
    return { root: JSON.stringify(outputResult) };
}

async function sendPostRequestJson(apiName, payload,successResult="No result") {
    let requestLog = {};

    // Find API information by the name of the API
    const api = apiInfo.functions.find(a => a.name === apiName);
    if (!api) {
        throw new Error(`API named '${apiName}' not found.`);
    }

    const url = api.path;
    const headers = api.request.headers || {};
    const timeout = api.timeout ? parseInt(api.timeout) * 1000 : 10000; // Convert timeout to milliseconds, default to 10s

    try {
        // Send POST request with timeout
        const response = await axios.post(url, payload, { headers, timeout });

        // Handle the response
        if (response.status === 200) {
            if (api.name !== "commom_error_option1"){
                successResult = response.data.result;
                const message = `Response for ${apiName} task is ${successResult}`;
                requestLog[`${apiName}TaskSuccess`] = message;
            }

            if (api.isLast) {
                return { response, successResult }; // Return the response and result if this is the last function
            } else {
                return await nextRequest(api, response, successResult);
            }
        }

        // Return the response and result even if the status is not 200
        return { response, successResult };
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorResult = error.response.data.result || "No error log";
            requestLog[`${apiName}TaskFailure`] = errorResult;

            if (api.isLast) {
                return { response: error.response, successResult }; // Return the response and result if this is the last function
            } else {
                return await nextRequest_Error(api, error.response, requestLog, successResult);
            }
        } else {
            console.error('Error in sendPostRequestJson:', error);
            throw error; // Re-throw other unknown errors
        }
    }
}

async function nextRequest(api, response, successResult) {
    const nextApis = api.next || [];
    for (const nextApi of nextApis) {
        const condition = nextApi.condition || [];
        const isConditionMet = condition.every(c => {
            return evaluateCondition(c, response.data);
        });

        if (isConditionMet) {
            const apiName = nextApi.name;
            const payload = response.data.nextInput ? formatData(response.data.nextInput) : formatData(successResult);
            return await sendPostRequestJson(apiName, payload, successResult);
        }
    }
}

async function nextRequest_Error(api, response,requestLog, successResult) {
    const nextApis = api.next || [];
    for (const nextApi of nextApis) {
        const condition = nextApi.condition || [];
        const isConditionMet = condition.every(c => {
            return evaluateCondition(c, response.data);
        });

        if (isConditionMet) {
            const apiName = nextApi.name;
            const payload = formatData(requestLog);
            return await sendPostRequestJson(apiName, payload, successResult);
        }
    }
}

// Helper function to evaluate condition
function evaluateCondition(condition, responseData) {
    const { key, operator, val } = condition;
    const actualVal = responseData[key];

    switch (operator) {
        case "=":
            return actualVal === val;
        case "!=":
            return actualVal !== val;
        case ">":
            return actualVal > val;
        case "<":
            return actualVal < val;
        // Add more operators as needed
        default:
            return false;
    }
}

// api for controller
app.post('/api', async (req, res) => {
    const payload = JSON.parse(req.body.root);

    try {
        // trigger the first function
        const {response, successResult} = await sendPostRequestJson(startFunction, formatData(payload)); //"number" is the first function of function chain!

        // Returning both the response and successResult to the client
        res.json({
            FailureTask: response.data.result,
            FunctionResult: successResult,
        });
    } catch (error) {
        console.error('Error in /api:', error);
        res.status(500).json({ error: error.message });
    }
});

// start service at 0.0.0.0:5000
app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5000');
});
```

### Key Features

1. **Dynamic Function Chaining**

```json
# function chain example
{
  "identifier": "fc1",
  "functions": [
    {
      "name": "number",
      "version": "0.1",
      "method": "POST",
      "path": "http://container3:5000/api",
      "request": {
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "dependsOn": [],
      "next": [
        {
          "name": "odd",
          "condition": [
            {
              "key": "status",
              "operator": "=",
              "val": "Success"
            }
          ]
        },
        {
          "name": "commom_error_option1",
          "condition": [
            {
              "key": "status",
              "operator": "=",
              "val": "Failure"
            }
          ]
        }
      ],
      "timeout": "10",
      "isLast": false
    },
    {
      "name": "odd",
      "version": "0.1",
      "method": "POST",
      "path": "http://container4:5000/api",
      "request": {
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "dependsOn": [
        {
          "name": "number",
          "required": true,
          "conditionMatchNeeded": false
        }
      ],
      "next": [
        {
          "name": "even",
          "condition": [
            {
              "key": "status",
              "operator": "=",
              "val": "Success"
            }
          ]
        },
        {
          "name": "commom_error_option1",
          "condition": [
            {
              "key": "status",
              "operator": "=",
              "val": "Failure"
            }
          ]
        }
      ],
      "timeout": "10",
      "isLast": false
    },
    {
      "name": "even",
      "version": "0.1",
      "method": "POST",
      "path": "http://container2:5000/api",
      "request": {
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "dependsOn": [
        {
          "name": "odd",
          "required": true,
          "conditionMatchNeeded": false
        }
      ],
      "next": [
        {
          "name": "commom_error_option1",
          "condition": [
            {
              "key": "status",
              "operator": "=",
              "val": "Failure"
            }
          ]
        }
      ],
      "timeout": "10",
      "isLast": false
    },
    {
      "name": "commom_error_option1",
      "version": "0.1",
      "method": "POST",
      "path": "http://container1:5000/api",
      "request": {
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "dependsOn": [],
      "next": [],
      "timeout": "10",
      "isLast": true
    }
  ],
  "startFunction": "number"
}
```

2. **Error Handling**
The system provides centralized error management through the Common Error Handler service, enhancing overall observability and maintainability. It supports graceful failure handling by delivering detailed error reporting, which facilitates quick identification and resolution of issues. Furthermore, the system automatically routes errors based on the status of individual services, ensuring stability and reliability even when certain components are temporarily unavailable.

3. **Monitoring and Logging**
The system includes comprehensive monitoring capabilities through request timing measurements, enabling performance tracking and latency analysis. It also maintains detailed logging of all service interactions, providing valuable insights for debugging, auditing, and system behavior analysis. Additionally, each service is equipped with health check endpoints to support real-time status monitoring and ensure reliable service operation.

## Deployment

The system uses a sophisticated deployment strategy:

### Automated Container Management
   - Single command deployment using `start_functions.sh`
   - Automatic network creation and container orchestration
   - Volume mounting for real-time code updates

To build the Docker images and start the containers, run the following script:

```bash
./start_functions.sh
```

This script will:

- Create a Docker network (`my_docker_network`) if it doesn't already exist. Dockers will conmunicate each other through this Docker network.
- Build Docker images for each service if they don't already exist.
- Start containers for each service, binding them to specific ports:
  - Controller: `localhost:5000`
  - Even Service: `localhost:5001`
  - Odd Service: `localhost:5002`
  - Number Service: `localhost:5003`
  - Common Error Handler: `localhost:5004`

To stop all running containers, execute the following script:

```bash
./stop_functions.sh
```

This script will stop all containers defined in the project.

To remove all containers and Docker images related to the project, use the following script:

```bash
./remove_image_container.sh
```

## Usage Example

Here's a simple example of how to interact with the system:

```bash
curl -X POST http://localhost:5000/api \
     -H 'Content-Type: application/json' \
     -d '{"root":"{\"Number\":\"2123214\"}"}'
```

Response:
```json
{
  "FailureTask": "oddTask",
  "FunctionResult": {"number":2123214}
}
```

## Benefits

### Modularity
   - Each function runs in isolation
   - Easy to add new functions or modify existing ones
   - Independent scaling of services

### Maintainability
   - Clear separation of concerns
   - Standardized error handling
   - Consistent API design across services

### Scalability
   - Container-based architecture enables easy horizontal scaling
   - Independent service deployment
   - Load balancing ready

## Future Enhancements

### Service Discovery
   - Implementation of service discovery mechanisms
   - Dynamic service registration

### Monitoring Dashboard
   - Real-time monitoring of function chains
   - Performance metrics visualization

### Advanced Error Recovery
   - Retry mechanisms
   - Circuit breaker implementation
   - Fallback strategies

## Conclusion

The Docker-Based Function Chaining System represents a modern approach to building distributed systems. Its microservices architecture, combined with Docker containerization, provides a robust foundation for building scalable and maintainable applications. The system's ability to handle complex function chains while maintaining loose coupling makes it an excellent choice for organizations looking to implement flexible and scalable processing pipelines.

The project demonstrates best practices in microservices architecture, container orchestration, and error handling, making it a valuable reference for similar implementations in production environments.

- [GitHub Repository](https://github.com/xiaoxiaoxiaotao/Stateful-Serverless-Function-Chian)