import './style.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';

const app = document.getElementById('app');
if (app) {
  mount(App, { target: app });
}
