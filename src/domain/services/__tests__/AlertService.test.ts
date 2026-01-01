import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    AlertService,
    AlertProvider,
    ConsoleAlertProvider
} from '../AlertService';
import { ValidationResult, Risk } from '../../entities/Conversation';

describe('AlertService', () => {
    describe('ConsoleAlertProvider', () => {
        it('should log alert message to console', async () => {
            const provider = new ConsoleAlertProvider();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await provider.sendAlert('Test alert', { test: 'data' });

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ALERT]'));
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            consoleSpy.mockRestore();
        });
    });

    describe('AlertService.checkAndAlert', () => {
        let mockProvider: AlertProvider;
        let alertService: AlertService;

        beforeEach(() => {
            mockProvider = {
                sendAlert: vi.fn().mockResolvedValue(undefined)
            };
            alertService = new AlertService(mockProvider);
        });

        it('should send alert when result is non-compliant with HIGH severity risks', async () => {
            const result: ValidationResult = {
                compliant: false,
                score: 50,
                risks: [
                    { category: 'SUICIDE_SELF_HARM', severity: 'HIGH', message: 'Crisis detected', weight: -50 }
                ],
                auditId: 'test-audit'
            };

            await alertService.checkAndAlert(result, { conversationId: '123' });

            expect(mockProvider.sendAlert).toHaveBeenCalledTimes(1);
            expect(mockProvider.sendAlert).toHaveBeenCalledWith(
                expect.stringContaining('Critical Compliance Violation'),
                expect.objectContaining({
                    subject: expect.stringContaining('URGENT'),
                    risks: expect.arrayContaining([
                        expect.objectContaining({ category: 'SUICIDE_SELF_HARM' })
                    ])
                })
            );
        });

        it('should NOT send alert when result is compliant', async () => {
            const result: ValidationResult = {
                compliant: true,
                score: 100,
                risks: [],
                auditId: 'test-audit'
            };

            await alertService.checkAndAlert(result);

            expect(mockProvider.sendAlert).not.toHaveBeenCalled();
        });

        it('should NOT send alert for non-compliant with only LOW severity risks', async () => {
            const result: ValidationResult = {
                compliant: false,
                score: 75,
                risks: [
                    { category: 'TRANSPARENCY', severity: 'LOW', message: 'Minor issue', weight: -10 }
                ],
                auditId: 'test-audit'
            };

            await alertService.checkAndAlert(result);

            expect(mockProvider.sendAlert).not.toHaveBeenCalled();
        });

        it('should send alert for multiple HIGH severity risks', async () => {
            const result: ValidationResult = {
                compliant: false,
                score: 20,
                risks: [
                    { category: 'SUICIDE_SELF_HARM', severity: 'HIGH', message: 'Crisis detected', weight: -50, triggeredBy: 'pattern1' },
                    { category: 'MANIPULATION', severity: 'HIGH', message: 'Manipulation detected', weight: -30, triggeredBy: 'pattern2' }
                ],
                auditId: 'test-audit'
            };

            await alertService.checkAndAlert(result, { sessionId: 'session-456' });

            expect(mockProvider.sendAlert).toHaveBeenCalledTimes(1);
            expect(mockProvider.sendAlert).toHaveBeenCalledWith(
                expect.stringContaining('2 HIGH severity risks'),
                expect.objectContaining({
                    risks: expect.arrayContaining([
                        expect.objectContaining({ category: 'SUICIDE_SELF_HARM', trigger: 'pattern1' }),
                        expect.objectContaining({ category: 'MANIPULATION', trigger: 'pattern2' })
                    ]),
                    conversationContext: { sessionId: 'session-456' }
                })
            );
        });

        it('should work with default ConsoleAlertProvider', async () => {
            const defaultAlertService = new AlertService();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result: ValidationResult = {
                compliant: false,
                score: 50,
                risks: [
                    { category: 'SUICIDE_SELF_HARM', severity: 'HIGH', message: 'Crisis', weight: -50 }
                ],
                auditId: 'test-audit'
            };

            await defaultAlertService.checkAndAlert(result);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
