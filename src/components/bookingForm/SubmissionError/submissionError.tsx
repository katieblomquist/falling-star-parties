import styles from './submissionError.module.css';

interface SubmissionErrorProps {
    firstName?: string;
    onRetry: () => void;
    errorMessage?: string;
    // ...existing code...
}

export default function SubmissionError({ 
    firstName, 
    onRetry, 
    errorMessage, 
    // ...existing code...
}: SubmissionErrorProps) {
    


    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Oops{firstName ? `, ${firstName}` : ''}!</h1>
                <p className={styles.message}>
                    {errorMessage || "We weren't able to submit your event request. This could be due to a temporary connection issue or server problem."}
                </p>
                <div className={styles.actions}>
                    <button 
                        onClick={onRetry}
                        className={styles.retryButton}
                        type="button"
                    >
                        Try Again
                    </button>
                </div>
                <p className={styles.footer}>
                    If you continue to experience issues, please contact us directly at info@fallingstarparties.com and we'll help you get your event booked.
                </p>
            </div>
        </div>
    );
}