#!/bin/bash

# 🎭 FPL Ranker - Playwright Test Runner
# Comprehensive test execution script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}🎭 FPL Ranker - Playwright Test Suite${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if application is running
check_app_running() {
    print_info "Checking if application is running on localhost:3000..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Application is running!"
    else
        print_error "Application is not running on localhost:3000"
        print_info "Please start the application with: npm run dev"
        exit 1
    fi
}

# Install dependencies if needed
check_dependencies() {
    print_info "Checking dependencies..."

    if [ ! -d "node_modules/@playwright/test" ]; then
        print_warning "Playwright not found. Installing dependencies..."
        npm install
        npx playwright install
    else
        print_success "Dependencies are installed!"
    fi
}

# Main test execution
run_tests() {
    local test_type=${1:-"all"}

    case $test_type in
        "smoke")
            print_info "Running smoke tests..."
            npx playwright test tests/e2e/home-page.spec.ts --project=chromium
            ;;
        "mobile")
            print_info "Running mobile tests..."
            npm run test:mobile
            ;;
        "accessibility")
            print_info "Running accessibility tests..."
            npm run test:accessibility
            ;;
        "visual")
            print_info "Running visual regression tests..."
            npm run test:visual
            ;;
        "api")
            print_info "Running API integration tests..."
            npx playwright test tests/e2e/api-mocking.spec.ts
            ;;
        "full")
            print_info "Running full test suite..."
            npm test
            ;;
        "debug")
            print_info "Running tests in debug mode..."
            npm run test:debug
            ;;
        "headed")
            print_info "Running tests with browser UI..."
            npm run test:headed
            ;;
        *)
            print_info "Running all tests..."
            npm test
            ;;
    esac
}

# Generate reports
generate_reports() {
    print_info "Generating test reports..."

    if [ -f "tests/reports/html/index.html" ]; then
        print_success "HTML report generated: tests/reports/html/index.html"
    fi

    if [ -f "tests/reports/json/results.json" ]; then
        print_success "JSON report generated: tests/reports/json/results.json"
    fi
}

# Show help
show_help() {
    echo "🎭 FPL Ranker Test Runner"
    echo ""
    echo "Usage: $0 [TEST_TYPE]"
    echo ""
    echo "Test Types:"
    echo "  smoke        - Quick smoke tests (home page only)"
    echo "  mobile       - Mobile and responsive tests"
    echo "  accessibility - Accessibility compliance tests"
    echo "  visual       - Visual regression tests"
    echo "  api          - API integration tests"
    echo "  full         - Complete test suite"
    echo "  debug        - Run tests in debug mode"
    echo "  headed       - Run tests with browser UI"
    echo "  all          - Same as full (default)"
    echo ""
    echo "Examples:"
    echo "  $0 smoke                # Quick validation"
    echo "  $0 mobile               # Test mobile devices"
    echo "  $0 accessibility        # Check WCAG compliance"
    echo "  $0 visual               # Visual regression"
    echo "  $0 debug                # Debug failing tests"
    echo ""
    echo "Reports will be available at:"
    echo "  - HTML: tests/reports/html/index.html"
    echo "  - JSON: tests/reports/json/results.json"
    echo "  - Screenshots: tests/screenshots/"
}

# Main execution
main() {
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
        exit 0
    fi

    print_header

    # Pre-flight checks
    check_dependencies
    check_app_running

    # Run tests
    if run_tests "$1"; then
        print_success "Tests completed successfully!"
        generate_reports

        # Show report location
        echo ""
        print_info "View test reports:"
        echo "  HTML Report: file://$(pwd)/tests/reports/html/index.html"
        echo "  JSON Report: $(pwd)/tests/reports/json/results.json"

        # Show useful commands
        echo ""
        print_info "Useful commands:"
        echo "  npm run test:report     # Open HTML report"
        echo "  npm run test:ui         # Interactive test UI"
        echo "  npm run test:debug      # Debug mode"

    else
        print_error "Tests failed!"
        print_info "Check the reports for details:"
        echo "  - HTML: tests/reports/html/index.html"
        echo "  - Screenshots: tests/screenshots/"
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"