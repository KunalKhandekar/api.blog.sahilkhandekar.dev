/**
 * Node modules
 */
import Agenda from 'agenda';

/**
 * Custom modules
 */
import config from '@/config';

const agenda = new Agenda({
  db: { address: config.MONGO_URI!, collection: 'agendaJobs' },
});

export default agenda;
