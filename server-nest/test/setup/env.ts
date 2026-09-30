// Runs before every e2e test module compiles. No env-loading is wired into
// the real app yet (separate, known gap -- see
// docs/nestjs-migration-spec.md); JwtStrategy/JwtModule read
// process.env.JWT_SECRET directly, so anything that boots the real
// AppModule needs this set.
process.env.JWT_SECRET ??= 'e2e-test-secret';
