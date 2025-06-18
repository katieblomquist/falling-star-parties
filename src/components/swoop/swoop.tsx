function LeftBottom(props: { color: string }) {
    return (
        <div style={{ marginTop: '-2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 121" fill="none">
                <path d="M0 0.39386L328 0.393799H1083.5H1728L1728 75.2969L1701.56 70.7563C1430.66 24.2315 1153.58 27.0763 883.698 79.1535C596.691 134.534 301.712 134.208 14.8276 78.1921L0 75.2969V0.39386Z" fill={props.color} />
            </svg>
        </div>
    )
}

function RightBottom(props: { color: string }) {
    return (
        <div style={{ marginTop: '-2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 108" fill="none">
                <path d="M1728 0.0136719H1384H578H0.00012207V66.8004L27.9634 62.5183C298.291 21.1223 573.541 23.8174 843.006 70.4989C1131.37 120.454 1426.21 120.013 1714.43 69.1938L1728 66.8004V0.0136719Z" fill={props.color} />
            </svg>
        </div>
    )

}

function RightTop(props: { color: string }) {
    return (
        <div style={{ marginBottom: '-7px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 108" fill="none">
                <path d="M1728 145.124H1264H514H0.00012207V54.9424L26.9543 60.5158C296.51 116.253 574.968 112.648 842.99 49.952C1129.61 -17.0951 1427.91 -16.5062 1714.26 51.6721L1728 54.9424V145.124Z" fill={props.color} />
            </svg>
        </div>
    )
}

function Center(props: { color: string }) {
    return (
        <div style={{ marginTop: '-2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 72" fill="none">
                <path d="M0 0.538651L1728 0.538635C1569.89 0.538635 1412.01 12.4873 1255.71 36.2825L1173.82 48.7487C972.455 79.4028 767.591 79.1024 566.32 47.8578L519.905 40.6525C347.891 13.9496 174.075 0.53864 0 0.538651Z" fill={props.color} />
            </svg>
        </div>
    )
}

export default function Swoop(props: { top: boolean, color: string, direction: string, }) {


    if (props.top) {
        if (props.direction === 'right') {
            return (<RightTop color={props.color} />)
        } else {
            return null;
        }
    }
    else if (props.direction === 'right') {
        return (<RightBottom color={props.color} />)
    }
    else if (props.direction === 'center') {
        return (<Center color={props.color} />)
    }
    else if (props.direction === 'left') {
        return (<LeftBottom color={props.color} />)
    }
    else {
        return null;
    }

}