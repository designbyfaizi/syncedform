<template>
    <div id="app">
        <h1>
            SyncedForm
        </h1>
        <div class="box">
            <div class="firebaseData">
                <h2>Firebase Data</h2>
                {{ firebaseData }}
            </div>
            <div class="formData">
                <h2>Form Data</h2>
                {{ formData }}
            </div>
        </div>
        <div class="notification is-success" v-if="state === 'synced'">
            Form is synced with Firestore
        </div>
        <div class="notification is-link" v-if="state === 'modified'">
            <span
                class="spinner-grow spinner-grow-sm"
                role="status"
                aria-hidden="true"
            ></span>
            <span class="">Form data changed, will sync with Firebase</span>
        </div>
        <div class="notification is-warning" v-else-if="state === 'revoked'">
            From data and Firebase revoked to original data
        </div>
        <div class="notification is-danger" v-else-if="state === 'error'">
            Failed to save to Firestore. {{ errorMessage }}
        </div>
        <div class="notification is-info" v-else-if="state === 'loading'">
            <span
                class="spinner-grow spinner-grow-sm"
                role="status"
                aria-hidden="true"
            ></span>
            <!-- <span class="">Loading...</span> -->
        </div>
        <form @submit.prevent="updateFirebase" @input="fieldUpdate">
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">NAME</span>
                <input
                    type="text"
                    class="form-control"
                    placeholder="name"
                    aria-label="name"
                    aria-describedby="basic-addon1"
                    name="name"
                    id="name"
                    v-model="formData.name"
                />
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">EMAIL</span>
                <input
                    type="email"
                    class="form-control"
                    placeholder="email"
                    aria-label="email"
                    aria-describedby="basic-addon1"
                    name="email"
                    id="email"
                    v-model="formData.email"
                />
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">PHONE</span>
                <input
                    type="tel"
                    class="form-control"
                    placeholder="phone"
                    aria-label="phone"
                    aria-describedby="basic-addon1"
                    name="phone"
                    id="phone"
                    v-model="formData.phone"
                />
            </div>
            <button type="submit" class="btn btn-primary m-2 p-1 px-2">
                SUBMIT
            </button>
            <!-- <button type="submit">SUBMIT</button> -->
        </form>
        <button @click="revertToOriginal" class="btn btn-danger m-2 px-3">
            REVERT
        </button>
    </div>
</template>

<script>
import { db } from "./firebase";
import { debounce } from "debounce";
import "bootstrap/dist/css/bootstrap.min.css";

const documentPath = "contacts/faizan";

export default {
    data() {
        return {
            firebaseData: null,
            formData: {},
            state: "loading",
            errorMessage: "",
            originalData: null,
        };
    },
    firestore() {
        return {
            firebaseData: db.doc(documentPath),
            formData: db.doc(documentPath),
        };
    },
    methods: {
        async updateFirebase() {
            try {
                await db.doc(documentPath).set(this.formData);
                this.state = "synced";
            } catch (err) {
                console.log(err);
                this.errorMessage = JSON.stringify(err);
                this.state = "error";
            }
        },
        fieldUpdate() {
            this.state = "modified";
            this.debouncedUpdate();
        },
        debouncedUpdate: debounce(function() {
            this.state = "modified";
            this.updateFirebase();
        }, 1500),
        revertToOriginal() {
            this.state = "loading";
            this.formData = { ...this.originalData };
            this.firebaseData = { ...this.originalData };
            this.updateFirebase();
            this.state = "revoked";
        },
    },
    created: async () => {
        const docRef = db.doc(documentPath);

        let data = (await docRef.get()).data();

        if (!data) {
            data = {
                name: "",
                email: "",
                phone: "",
            };
            docRef.set(data);
        }

        this.formData = data;
        this.originalData = { ...data };
        this.state = "synced";
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.firebaseData {
    flex: 40%;
}
.formData {
    flex: 40%;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input-group {
    max-width: 400px;
}

form > * {
    margin: 1rem;
}
</style>
