import styles from './footer.module.css'

export default function Footer(){
    return(
        <div  className={styles.footer}>
            <p>© 2025 | Falling Star Parties LLC | All Rights Reserved</p>
            <p>Falling Star Parties LLC characters are not the copyrighted, trademarked, or licensed characters you may be familiar with. 
                Our characters represent classic fairytale stories. We have no affiliation with any company or group that may own the rights 
                to similar characters or stories and apologize for any inconvenience this may cause you.</p>
                <div className={styles.links}>
                    <p ><a href="https://forms.gle/fV959EENcrtcVEJw7" target="_blank" className={styles.link}>Join Our Team</a></p>
                    <p className={styles.link}>Terms of Service</p>
                    <p className={styles.link}>Media Kit</p>
                </div>
        </div>
    )
}