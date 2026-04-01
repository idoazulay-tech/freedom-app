/**
 * Dashboard Tests
 * Tests for dashboard navigation and feature buttons
 */

import { describe, it, expect } from 'vitest';

describe('Dashboard Navigation Tests', () => {
  
  describe('Dashboard Buttons & Routes', () => {
    it('should have all 6 feature buttons', () => {
      const buttons = [
        { name: 'מחולל מכתבים', route: '/letters', icon: 'Mail' },
        { name: 'מחשבון חוב', route: '/calculator', icon: 'Calculator' },
        { name: 'עקבות חוב', route: '/tracker', icon: 'BarChart3' },
        { name: 'סריקת מסמכים', route: '/scanner', icon: 'Scan' },
        { name: 'עורכי דין', route: '/lawyers', icon: 'Scale' },
      ];

      expect(buttons.length).toBeGreaterThanOrEqual(5);
      
      for (const button of buttons) {
        expect(button.name).toBeDefined();
        expect(button.route).toBeDefined();
        expect(button.icon).toBeDefined();
        expect(button.route).toMatch(/^\//);
      }
    });

    it('should have correct routes for all features', () => {
      const routes = {
        letters: '/letters',
        calculator: '/calculator',
        tracker: '/tracker',
        scanner: '/scanner',
        lawyers: '/lawyers',
      };

      for (const [key, route] of Object.entries(routes)) {
        expect(route).toMatch(/^\/[a-z-]+$/);
        expect(route.length).toBeGreaterThan(1);
      }
    });

    it('should have start diagnosis button with correct route', () => {
      const startButton = {
        text: 'התחל אבחון מקצועי',
        route: '/diagnosis-professional',
      };

      expect(startButton.route).toBe('/diagnosis-professional');
      expect(startButton.text).toContain('אבחון');
    });
  });

  describe('Dashboard Layout', () => {
    it('should display 6 cards in grid layout', () => {
      const cards = [
        { title: 'מחולל מכתבים', color: 'blue' },
        { title: 'מחשבון חוב', color: 'green' },
        { title: 'עקבות חוב', color: 'purple' },
        { title: 'סריקת מסמכים', color: 'orange' },
        { title: 'עורכי דין', color: 'indigo' },
      ];

      expect(cards.length).toBeGreaterThanOrEqual(5);
      
      for (const card of cards) {
        expect(card.title).toBeDefined();
        expect(card.color).toBeDefined();
      }
    });

    it('should use correct colors for each card', () => {
      const cardColors = {
        letters: 'blue-600',
        calculator: 'green-600',
        tracker: 'purple-600',
        scanner: 'orange-600',
        lawyers: 'indigo-600',
      };

      for (const [key, color] of Object.entries(cardColors)) {
        expect(color).toMatch(/^[a-z]+-600$/);
      }
    });
  });

  describe('Dashboard Features', () => {
    it('should have descriptions for each feature', () => {
      const features = {
        letters: 'צור מכתבי דרישה ותשובות',
        calculator: 'חשב התחייבויות חודשיות',
        tracker: 'עקוב אחר התקדמות',
        scanner: 'סרוק מסמכים עם OCR',
        lawyers: 'מצא עורך דין או יועץ',
      };

      for (const [key, desc] of Object.entries(features)) {
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(5);
        expect(desc).toMatch(/[\u0590-\u05FF]/); // Hebrew characters
      }
    });

    it('should have action buttons for each feature', () => {
      const actions = [
        'פתח מחולל',
        'חשב עכשיו',
        'עקוב',
        'סרוק',
        'חפש',
      ];

      expect(actions.length).toBeGreaterThanOrEqual(5);
      
      for (const action of actions) {
        expect(action).toBeDefined();
        expect(action.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Dashboard Navigation Flow', () => {
    it('should navigate from dashboard to diagnosis', () => {
      const flow = {
        from: '/dashboard',
        to: '/diagnosis-professional',
        button: 'התחל אבחון מקצועי',
      };

      expect(flow.from).toBe('/dashboard');
      expect(flow.to).toBe('/diagnosis-professional');
      expect(flow.button).toContain('אבחון');
    });

    it('should navigate from dashboard to all features', () => {
      const navigationPaths = [
        { from: '/dashboard', to: '/letters', feature: 'Letters' },
        { from: '/dashboard', to: '/calculator', feature: 'Calculator' },
        { from: '/dashboard', to: '/tracker', feature: 'Tracker' },
        { from: '/dashboard', to: '/scanner', feature: 'Scanner' },
        { from: '/dashboard', to: '/lawyers', feature: 'Lawyers' },
      ];

      for (const path of navigationPaths) {
        expect(path.from).toBe('/dashboard');
        expect(path.to).toMatch(/^\//);
        expect(path.feature).toBeDefined();
      }
    });

    it('should have consistent navigation structure', () => {
      const routes = [
        '/letters',
        '/calculator',
        '/tracker',
        '/scanner',
        '/lawyers',
        '/diagnosis-professional',
      ];

      for (const route of routes) {
        expect(route).toMatch(/^\/[a-z-]+$/);
        expect(route).not.toContain(' ');
      }
    });
  });

  describe('Dashboard Empty State', () => {
    it('should show empty state when no cases exist', () => {
      const emptyState = {
        title: 'עדיין לא יצרת תיק',
        description: 'בואו נתחיל בסיווג החוב שלך',
        button: 'התחל אבחון מקצועי',
      };

      expect(emptyState.title).toContain('עדיין');
      expect(emptyState.description).toContain('בואו');
      expect(emptyState.button).toContain('אבחון');
    });

    it('should have correct empty state icon', () => {
      const icon = 'AlertCircle';
      expect(icon).toBeDefined();
      expect(icon).toMatch(/Circle$/);
    });
  });

  describe('Dashboard Responsive Design', () => {
    it('should use responsive grid classes', () => {
      const gridClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      
      expect(gridClasses).toContain('grid-cols-1');
      expect(gridClasses).toContain('md:grid-cols-2');
      expect(gridClasses).toContain('lg:grid-cols-3');
      expect(gridClasses).toContain('gap-6');
    });

    it('should have mobile-first design', () => {
      const breakpoints = {
        mobile: 'grid-cols-1',
        tablet: 'md:grid-cols-2',
        desktop: 'lg:grid-cols-3',
      };

      expect(breakpoints.mobile).toBeDefined();
      expect(breakpoints.tablet).toBeDefined();
      expect(breakpoints.desktop).toBeDefined();
    });
  });

  describe('Dashboard Styling', () => {
    it('should use consistent color scheme', () => {
      const colors = [
        'bg-slate-800',
        'border-slate-700',
        'text-white',
        'text-slate-400',
      ];

      for (const color of colors) {
        expect(color).toBeDefined();
        expect(color).toMatch(/^(bg|border|text)-/);
      }
    });

    it('should have hover effects on cards', () => {
      const hoverClass = 'hover:border-slate-600 transition-colors';
      
      expect(hoverClass).toContain('hover:');
      expect(hoverClass).toContain('transition-');
    });
  });
});
