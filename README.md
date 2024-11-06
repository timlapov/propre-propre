# ProprePropre

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.3.

## Launch in a docker container
### Requirements

- Docker
- Docker Compose

### Installation and Running

1. Clone the repository:

```git clone https://github.com/timlapov/propre-propre.git```
```cd propre-propre```
2. Build and run the Docker container:

```docker build -t propre-propre .```

```docker run -p 8080:8080 propre-propre```

The application will be available at `http://localhost:8080/`.

## Development

For development purposes, you can use the following commands:

1. Install dependencies:

```npm install```
2. Run the development server:

```ng serve```

The app will be available at `http://localhost:4200/`.

## Building

To create a production version of the app:

```ng build --prod```
The built files will be in the `dist/` directory.

## Testing

To run unit tests:

```ng test```

To run e2e tests:

```ng e2e```

## Project Structure

- `src/app/` - application components
- `src/services/` - services for API communication and business logic
- `src/environments/` - configuration files for different environments

## License

This project is provided under a restricted license. It is available for viewing purposes only to demonstrate the author's skills for potential employers. Use of the code, including but not limited to copying, modifying, or redistributing, is strictly prohibited without explicit permission.

## Additional Information

For more information about Angular CLI, use `ng help` or check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
