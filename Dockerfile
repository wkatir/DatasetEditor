FROM node:18-slim

# Install apt dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    wget \
    ca-certificates \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libegl1-mesa \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Clone the repository with depth 1 (shallow clone)
RUN git clone --depth 1 https://github.com/wkatir/DatasetEditor.git /dataset-editor

# Change to the project directory
WORKDIR /dataset-editor

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build

# Expose port 7860
EXPOSE 7860

# Set environment variables
ENV PORT=7860
ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "start"] 