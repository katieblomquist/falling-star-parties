import Dropdown from "@/components/form/Dropdown/dropdown";
import TextInput from "@/components/form/Text Input/textInput";
import styles from "./information.module.css";
import { Controller, UseFormResetField } from "react-hook-form";
import { event } from "@/app/mockData";
import { FormValues } from "@/app/book/page";


export default function Information(props: { control: any, resetField: UseFormResetField<FormValues> }) {

    function handleChangeEvnetType(value: string){
        props.resetField('ChildAge');
        props.resetField('ChildName');
        props.resetField('Extras');
        props.resetField('OrganizationName');
        props.resetField('Package');

        return(value);
    }

    return (
        <>
            <div>
                <h3 className={styles.header}>Name</h3>
                <div className={styles.nameInput}>
                    <Controller
                        control={props.control}
                        name="FirstName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="First Name" required={true} id="firstName" label="First Name" input={value} onChange={onChange} />
                        )}
                    />
                    <Controller
                        control={props.control}
                        name="LastName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="Last Name" required={true} id="lastName" label={"Last Name"} input={value} onChange={onChange} />
                        )}
                    />
                </div>
            </div>

            <div>
                <h3 className={styles.header}>Email</h3>
                <Controller
                    control={props.control}
                    name="Email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="email" placeholder="Email" required={true} id="email" label="Email" input={value} onChange={onChange} />
                    )}
                />
            </div>

            <div>
                <h3 className={styles.header}>Phone</h3>
                <Controller
                    control={props.control}
                    name="Phone"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="tel" placeholder="Phone" required={true} id="phone" label="Phone" input={value} onChange={onChange} />
                    )}
                />
            </div>

            <div>
                <h3 className={styles.header}>Event Type</h3>
                <Controller
                    control={props.control}
                    name="EventType"
                    render={({ field: { onChange, value } }) => (
                            <Dropdown options={event} selected={value} setData={(value) => {
                                onChange(handleChangeEvnetType(value))
                            }} />
                    )}
                />

            </div>

        </>
    )
}