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
            Form data changed, will sync with Firebase
        </div>
        <div class="notification is-warning" v-else-if="state === 'revoked'">
            From data and Firebase revoked to original data
        </div>
        <div class="notification is-danger" v-else-if="state === 'error'">
            Failed to save to Firestore. {{ errorMessage }}
        </div>
        <div class="notification is-info" v-else-if="state === 'loading'">
            Loading...
        </div>
        <form @submit.prevent="updateFirebase" @input="fieldUpdate">
            <input
                placeholder="name"
                type="text"
                name="name"
                id="name"
                v-model="formData.name"
            />
            <input
                placeholder="email"
                type="email"
                name="email"
                id="email"
                v-model="formData.email"
            />
            <input
                placeholder="phone"
                type="tel"
                name="phone"
                id="phone"
                v-model="formData.phone"
            />
            <button type="submit">SUBMIT</button>
        </form>
        <button @click="revertToOriginal">REVERT</button>
    </div>
</template>

<script>
import { db } from "./firebase";
import { debounce } from "debounce";

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
            this.state = "revoked";
            this.formData = { ...this.originalData };
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

form > * {
    margin: 1rem;
}
</style>
