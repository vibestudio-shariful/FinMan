name: React Native Android Build
on:
  push:
    branches:
      - main  # আপনি চাইলে আপনার নতুন ব্রাঞ্চের নামও দিতে পারেন

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install Dependencies
        run: npm install

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }} # ঐচ্ছিক, যদি আপনি এক্সপো ক্লাউড ব্যবহার করেন

      - name: Build Android Release
        run: |
          # এই কমান্ডটি আপনার প্রজেক্টকে অ্যান্ড্রয়েড ফোল্ডারে রূপান্তর করবে
          npx expo export
          cd android && ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: my-native-app-apk
          path: android/app/build/outputs/apk/release/*.apk
