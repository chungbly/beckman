import { Jodit as JoditES5 } from 'jodit/esm/index';
import type { Jodit as JoditConstructorType } from 'jodit/esm/jodit';
import '../../public/jodit.css';

import 'jodit/esm/plugins/all';

export const Jodit: typeof JoditConstructorType = JoditES5;