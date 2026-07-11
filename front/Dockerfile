FROM node:20.11.0

ENV TZ Asia/Tokyo

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app

CMD ["npm", "run", "dev", "--", "-p", "4000"]