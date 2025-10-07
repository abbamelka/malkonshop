#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project structure
PROJECT_DIR="ecommerce-backend"

echo -e "${BLUE}🚀 Creating Enterprise E-commerce Backend Structure${NC}"
echo -e "${YELLOW}Project: $PROJECT_DIR${NC}"
echo ""

# Function to create directory
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}✓ Created directory: $1${NC}"
    else
        echo -e "${YELLOW}⚠ Directory already exists: $1${NC}"
    fi
}

# Function to create empty file
create_file() {
    if [ ! -f "$1" ]; then
        touch "$1"
        echo -e "${GREEN}✓ Created file: $1${NC}"
    else
        echo -e "${YELLOW}⚠ File already exists: $1${NC}"
    fi
}

# Create main project directory
create_dir "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create all directories
echo -e "\n${BLUE}📁 Creating directory structure...${NC}"

# Main directories
create_dir "config"
create_dir "models"
create_dir "repositories"
create_dir "services"
create_dir "controllers"
create_dir "routes"
create_dir "middleware"
create_dir "uploads/products"
create_dir "uploads/users"
create_dir "uploads/temp"
create_dir "utils"
create_dir "tests/unit"
create_dir "tests/integration"
create_dir "tests/fixtures"
create_dir "docs"
create_dir "scripts"
create_dir "logs"

# Create configuration files
echo -e "\n${BLUE}⚙️  Creating configuration files...${NC}"
create_file "config/database.js"
create_file "config/cloudinary.js"
create_file "config/redis.js"
create_file "config/email.js"
create_file "config/payment.js"
create_file "config/constants.js"

# Create model files
echo -e "\n${BLUE}📊 Creating model files...${NC}"
create_file "models/User.js"
create_file "models/Product.js"
create_file "models/Category.js"
create_file "models/Order.js"
create_file "models/Cart.js"
create_file "models/Review.js"
create_file "models/Address.js"
create_file "models/Wishlist.js"

# Create repository files
echo -e "\n${BLUE}🗄️  Creating repository files...${NC}"
create_file "repositories/baseRepository.js"
create_file "repositories/userRepository.js"
create_file "repositories/productRepository.js"
create_file "repositories/orderRepository.js"
create_file "repositories/cartRepository.js"
create_file "repositories/categoryRepository.js"

# Create service files
echo -e "\n${BLUE}🔧 Creating service files...${NC}"
create_file "services/userService.js"
create_file "services/productService.js"
create_file "services/orderService.js"
create_file "services/cartService.js"
create_file "services/authService.js"
create_file "services/emailService.js"
create_file "services/paymentService.js"
create_file "services/fileService.js"

# Create controller files
echo -e "\n${BLUE}🎮 Creating controller files...${NC}"
create_file "controllers/userController.js"
create_file "controllers/productController.js"
create_file "controllers/orderController.js"
create_file "controllers/cartController.js"
create_file "controllers/authController.js"
create_file "controllers/categoryController.js"
create_file "controllers/paymentController.js"

# Create middleware files
echo -e "\n${BLUE}🛡️  Creating middleware files...${NC}"
create_file "middleware/auth.js"
create_file "middleware/validation.js"
create_file "middleware/errorHandler.js"
create_file "middleware/rateLimiter.js"
create_file "middleware/logger.js"
create_file "middleware/upload.js"
create_file "middleware/cache.js"

# Create route files
echo -e "\n${BLUE}🛣️  Creating route files...${NC}"
create_file "routes/index.js"
create_file "routes/userRoutes.js"
create_file "routes/productRoutes.js"
create_file "routes/orderRoutes.js"
create_file "routes/cartRoutes.js"
create_file "routes/authRoutes.js"
create_file "routes/categoryRoutes.js"
create_file "routes/paymentRoutes.js"

# Create utility files
echo -e "\n${BLUE}🔨 Creating utility files...${NC}"
create_file "utils/helpers.js"
create_file "utils/constants.js"
create_file "utils/validators.js"
create_file "utils/logger.js"
create_file "utils/apiFeatures.js"
create_file "utils/responseHandler.js"
create_file "utils/errors.js"

# Create test files
echo -e "\n${BLUE}🧪 Creating test structure...${NC}"
create_file "tests/unit/user.test.js"
create_file "tests/unit/product.test.js"
create_file "tests/integration/auth.test.js"
create_file "tests/fixtures/users.js"

# Create documentation files
echo -e "\n${BLUE}📚 Creating documentation...${NC}"
create_file "docs/api.md"
create_file "docs/setup.md"

# Create script files
echo -e "\n${BLUE}📜 Creating script files...${NC}"
create_file "scripts/seed.js"
create_file "scripts/backup.js"

# Create main application files
echo -e "\n${BLUE}📦 Creating main application files...${NC}"
create_file "app.js"
create_file "server.js"
create_file "package.json"
create_file ".env"
create_file ".env.example"
create_file ".gitignore"
create_file "README.md"

echo -e "\n${GREEN}🎉 Project structure created successfully!${NC}"
echo -e "${YELLOW}📍 Location: $(pwd)${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. ${YELLOW}cd $PROJECT_DIR${NC}"
echo -e "2. ${YELLOW}npm init -y${NC}"
echo -e "3. ${YELLOW}Install dependencies${NC}"
echo -e "4. ${YELLOW}Configure your .env file${NC}"
