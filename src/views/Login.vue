<template>
  <div style="padding: 20px">
    <h2>Login Karyawan</h2>

    <input v-model="email" placeholder="Email" />
    <br /><br />

    <input v-model="password" type="password" placeholder="Password" />
    <br /><br />

    <button @click="login">Login</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      const res = await fetch(
        "https://braydon-plausive-malaya.ngrok-free.dev/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login berhasil");

        // PINDAH KE PRESENSI
        this.$router.push("/presensi");
      } else {
        alert(data.message);
      }
    },
  },
};
</script>
