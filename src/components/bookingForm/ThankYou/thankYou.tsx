import styles from './thankYou.module.css';

interface ThankYouProps {
    requestId?: string;
    firstName?: string;
}

export default function ThankYou({ requestId, firstName }: ThankYouProps) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <svg 
                        className={styles.checkIcon} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                        />
                    </svg>
                </div>
                <h1 className={styles.title}>Thank You{firstName ? `, ${firstName}` : ''}!</h1>
                <p className={styles.message}>
                    Your event request has been submitted successfully. We&apos;ve received your booking details and will review your request shortly.
                </p>
                <div className={styles.nextSteps}>
                    <h2 className={styles.subtitle}>What happens next?</h2>
                    <ul className={styles.stepsList}>
                        <li>We&apos;ll review your event details within 72 hours</li>
                        <li>If we&apos;re available, you&apos;ll receive a confirmation email with pricing and your retainer invoice</li>
                        <li>Once your payment is received, you&apos;re all set! </li>
                    </ul>
                </div>
                <p className={styles.footer}>
                    If you have any questions, feel free to reach out to us directly.
                </p>
            </div>
        </div>
    );
}
