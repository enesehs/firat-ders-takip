#!/usr/bin/env node

const puppeteer = require('puppeteer');
const notifier = require('node-notifier');
const chalk = require('chalk');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Academic Schedule Manager
 * Auto-attends Fırat University online classes
 */

class ScheduleManager {
  constructor() {
    this.configFile = path.join(__dirname, 'config.json');
    this.credentialsFile = path.join(__dirname, '.credentials.enc');
    this.schedule = [];
    this.credentials = null;
    this.browser = null;
    this.checkInterval = null;
    this.debug = true;
    this.isChecking = false;
    this.notifiedClasses = new Set();
    this.NAVIGATION_TIMEOUT = 30000;
  }

  /**
   * Initialize the application
   */
  async init() {
    this.log('info', '🎓 Academic Schedule Manager Starting...');
    
    // Load or create configuration
    await this.loadConfig();
    
    // Load or request credentials
    await this.loadCredentials();
    
    // Start the schedule monitor
    await this.startMonitoring();
  }

  /**
   * Comprehensive debug logging
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': chalk.blue('ℹ'),
      'success': chalk.green('✓'),
      'warning': chalk.yellow('⚠'),
      'error': chalk.red('✗'),
      'debug': chalk.gray('►')
    }[level] || '•';

    console.log(`${chalk.gray(timestamp)} ${prefix} ${message}`);
    
    if (data && this.debug) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }

    // Write to log file
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(path.join(__dirname, 'app.log'), logMessage);
  }

  /**
   * Load or create configuration file
   */
  async loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.schedule = config.schedule || [];
        this.notificationMinutes = config.notificationMinutes || 5;
        this.log('success', 'Configuration loaded');
      } else {
        await this.createConfig();
      }
    } catch (error) {
      this.log('error', 'Failed to load config', error.message);
      await this.createConfig();
    }
  }

  /**
   * Create new configuration with user input
   */
  async createConfig() {
    this.log('info', 'Creating new configuration...');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    console.log(chalk.cyan('\n📅 Weekly Schedule Setup'));
    console.log(chalk.gray('Enter your class schedule (leave blank when done)\n'));

    const schedule = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const day of days) {
      console.log(chalk.yellow(`\n${day}:`));
      
      while (true) {
        const time = await question(`  Enter class time (HH:MM, or press Enter to skip): `);
        if (!time) break;
        
        const url = await question(`  Enter class URL: `);
        const name = await question(`  Enter class name: `);
        
        schedule.push({
          day: day,
          time: time,
          url: url,
          name: name
        });
        
        this.log('success', `Added class: ${name} on ${day} at ${time}`);
      }
    }

    const notificationMinutes = await question('\n⏰ Minutes before class for notification (default: 5): ');
    
    const config = {
      schedule: schedule,
      notificationMinutes: parseInt(notificationMinutes) || 5
    };

    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    this.schedule = config.schedule;
    this.notificationMinutes = config.notificationMinutes;
    
    rl.close();
    this.log('success', 'Configuration saved');
  }

  /**
   * Load encrypted credentials
   */
  async loadCredentials() {
    try {
      if (fs.existsSync(this.credentialsFile)) {
        const encrypted = fs.readFileSync(this.credentialsFile, 'utf8');
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const password = await new Promise((resolve) => {
          rl.question('🔐 Enter master password to decrypt credentials: ', resolve);
        });
        rl.close();

        const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
        
        if (!decrypted || decrypted === '') {
          throw new Error('Invalid password');
        }
        
        try {
          this.credentials = JSON.parse(decrypted);
        } catch (error) {
          throw new Error('Invalid password or corrupted credentials');
        }
        this.log('success', 'Credentials loaded');
      } else {
        await this.createCredentials();
      }
    } catch (error) {
      this.log('error', 'Failed to load credentials', error.message);
      await this.createCredentials();
    }
  }

  /**
   * Create and encrypt credentials
   */
  async createCredentials() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    console.log(chalk.cyan('\n🔐 Secure Credential Storage Setup'));
    
    const username = await question('Username (student ID): ');
    const password = await question('Password: ');
    const masterPassword = await question('Create master password for encryption: ');

    const credentials = {
      username: username,
      password: password
    };

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(credentials), masterPassword).toString();
    fs.writeFileSync(this.credentialsFile, encrypted);
    
    this.credentials = credentials;
    rl.close();
    
    this.log('success', 'Credentials encrypted and saved');
  }

  /**
   * Start monitoring schedule
   */
  async startMonitoring() {
    this.log('info', '⏰ Schedule monitoring started');
    
    // Check immediately
    await this.checkSchedule();
    
    // Use recursive setTimeout to prevent overlapping checks
    const scheduleNextCheck = () => {
      this.checkInterval = setTimeout(async () => {
        await this.checkSchedule();
        scheduleNextCheck();
      }, 60000);
    };
    
    scheduleNextCheck();
  }

  /**
   * Check current schedule and take action
   */
  async checkSchedule() {
    // Prevent overlapping checks
    if (this.isChecking) {
      this.log('debug', 'Previous check still running, skipping');
      return;
    }

    this.isChecking = true;
    
    try {
      const now = new Date();
      const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      this.log('debug', `Checking schedule: ${currentDay} ${currentTime}`);
      
      // Get today's classes
      const todayClasses = this.schedule.filter(c => c.day === currentDay);
      
      if (todayClasses.length === 0) {
        this.displayNoClasses();
        return;
      }

      // Sort classes by time
      todayClasses.sort((a, b) => a.time.localeCompare(b.time));
      
      // Find next class
      const nextClass = todayClasses.find(c => c.time > currentTime);
      
      if (nextClass) {
        this.displayCountdown(nextClass);
        
        // Check if notification should be sent
        const classKey = `${nextClass.day}-${nextClass.time}-${nextClass.name}`;
        const classTime = this.parseTime(nextClass.time);
        const notificationTime = new Date(classTime.getTime() - this.notificationMinutes * 60000);
        
        if (now >= notificationTime && now < classTime && !this.notifiedClasses.has(classKey)) {
          await this.sendNotification(nextClass);
          this.notifiedClasses.add(classKey);
        }
        
        // Check if class should start now
        if (currentTime === nextClass.time) {
          await this.attendClass(nextClass);
        }
      } else {
        this.log('info', '✅ All classes completed for today');
      }
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Display "no classes today" indicator
   */
  displayNoClasses() {
    console.clear();
    console.log(chalk.cyan.bold('\n╔══════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║   🎉 NO CLASSES TODAY 🎉             ║'));
    console.log(chalk.cyan.bold('╔══════════════════════════════════════╗\n'));
    this.log('info', 'No classes scheduled for today - enjoy your day! 🌟');
  }

  /**
   * Display live countdown to next class
   */
  displayCountdown(nextClass) {
    const now = new Date();
    const classTime = this.parseTime(nextClass.time);
    const diff = classTime - now;
    
    if (diff > 0) {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      process.stdout.write(`\r⏰ Next class: ${chalk.yellow(nextClass.name)} in ${chalk.green(`${hours}h ${minutes}m ${seconds}s`)} at ${chalk.cyan(nextClass.time)}   `);
    }
  }

  /**
   * Parse time string to Date object
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Send pre-class notification
   */
  async sendNotification(classInfo) {
    this.log('info', `📢 Sending notification for: ${classInfo.name}`);
    
    notifier.notify({
      title: '🎓 Class Starting Soon!',
      message: `${classInfo.name} starts in ${this.notificationMinutes} minutes`,
      sound: true,
      wait: false
    });
  }

  /**
   * Automated CAS login and class attendance
   */
  async attendClass(classInfo) {
    this.log('info', `🚀 Starting automated attendance for: ${classInfo.name}`);
    
    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized']
      });
      
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      this.log('debug', 'Browser launched');
      
      // Navigate to CAS login
      this.log('info', '🔐 Navigating to CAS login...');
      await page.goto('https://jasig.firat.edu.tr/cas/login', { 
        waitUntil: 'networkidle2',
        timeout: this.NAVIGATION_TIMEOUT 
      });
      
      // Take debug screenshot
      await page.screenshot({ path: 'debug-login.png' });
      this.log('debug', 'Screenshot saved: debug-login.png');
      
      // Fill credentials
      this.log('info', 'Entering credentials...');
      await page.type('#username', this.credentials.username);
      await page.type('#password', this.credentials.password);
      
      // Submit login
      this.log('info', 'Submitting login...');
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: this.NAVIGATION_TIMEOUT })
      ]);
      
      this.log('success', '✅ CAS login successful');
      
      // Navigate to class
      this.log('info', `📚 Navigating to class: ${classInfo.name}`);
      await page.goto(classInfo.url, { 
        waitUntil: 'networkidle2',
        timeout: this.NAVIGATION_TIMEOUT 
      });
      
      // Take debug screenshot
      await page.screenshot({ path: 'debug-class.png' });
      this.log('debug', 'Screenshot saved: debug-class.png');
      
      this.log('success', `✅ Successfully joined class: ${classInfo.name}`);
      
      // Send success notification
      notifier.notify({
        title: '✅ Class Joined!',
        message: `Successfully joined ${classInfo.name}`,
        sound: true
      });
      
      // Keep browser open for the class duration
      this.log('info', 'Browser will remain open for class. Close manually when done or press Ctrl+C to exit.');
      
    } catch (error) {
      this.log('error', 'Failed to attend class', error.message);
      
      // Send error notification
      notifier.notify({
        title: '❌ Attendance Failed',
        message: `Failed to join ${classInfo.name}: ${error.message}`,
        sound: true
      });
      
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    this.log('info', '🛑 Shutting down...');
    
    if (this.checkInterval) {
      clearTimeout(this.checkInterval);
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    this.log('success', 'Goodbye! 👋');
    process.exit(0);
  }
}

// Main execution
const manager = new ScheduleManager();

// Handle graceful shutdown
process.on('SIGINT', () => {
  manager.shutdown();
});

process.on('SIGTERM', () => {
  manager.shutdown();
});

// Start the application
manager.init().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
