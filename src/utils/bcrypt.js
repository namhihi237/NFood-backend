import { hash, compare } from 'bcrypt';
class BcryptUtils {
	async hashPassword(password) {
		return hash(password, 12);
	}

	async comparePassword(password, hashPassword) {
		const match = await compare(password, hashPassword);
		if (!match) return false;
		else return true;
	}
}

export default new BcryptUtils();